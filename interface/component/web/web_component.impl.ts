import { Nimble } from '../../..';
import { Component } from "./../base/component.impl";
import { WebComponentInterface } from "./web_component.interface";
import Renderer from './../../vendor/renderer/renderer.impl'
import { all_events } from '../../util/js_events';
import { Style } from './style';
import { RouteRoot } from '../../..';
const sass = require('sass');


function addPropertyObserver(instance: any, propertyName: string, observer: any) {
    let value = instance[propertyName];

    Object.defineProperty(instance, propertyName, {
        get() {
            return value;
        },
        set(newValue) {
            value = newValue;
            observer(propertyName, newValue);
        },
        enumerable: true,
        configurable: true,
    });
}

function softNavigate(child: Element, pathRequested: Attr) {
    let foundComponent: WebComponent = undefined;
    if (Nimble.hasComponent(
        child.id.split('_')?.[1]
    ) && 'onInternalNavigate' in Nimble.get<WebComponent>(
        child.id.split('_')?.[1]
    )) {
        foundComponent = Nimble.get(child.id.split('_')?.[1]) as WebComponent;
        window.history.pushState({}, pathRequested.value, window.location.origin + pathRequested.value);
        (foundComponent as any).onInternalNavigate(event, pathRequested.value);
        foundComponent.refresh();
    } else {
        let tempchild = child;
        while (tempchild.parentElement && !foundComponent) {
            if (Nimble.hasComponent(
                tempchild.parentElement.id.split('_')?.[1]
            ) && 'onInternalNavigate' in Nimble.get<WebComponent>(
                tempchild.parentElement.id.split('_')?.[1]
            )) {

                foundComponent = Nimble.get(tempchild.parentElement.id.split('_')?.[1]) as WebComponent;
                window.history.pushState({}, pathRequested.value, window.location.origin + pathRequested.value);
                (foundComponent as any).onInternalNavigate(event, pathRequested.value);
                foundComponent.refresh();
            }
            else {
                tempchild = tempchild.parentElement;
            }
        }
    }
}

function attachChildListeners(children: HTMLCollection) {
    for (let i = 0; i < children.length; i++) {
        const child = children.item(i);
        const foundEvent = all_events.find((e: string) => child.attributes.getNamedItem(e) !== null);

        if (foundEvent) {
            let foundComponent: WebComponent = undefined;
            let tempchild = child;
            while (tempchild.parentElement && !foundComponent) {
                if (Nimble.hasComponent(
                    tempchild.parentElement.id.split('_')?.[1]
                )) {
                    foundComponent = Nimble.get(tempchild.parentElement.id.split('_')?.[1]) as WebComponent;
                }
                else {
                    tempchild = tempchild.parentElement;
                }
            }
            child.addEventListener(foundEvent.replace('(', '').replace(')', ''), () => { function evalInContext(str: string) { eval(str) }; evalInContext.call(foundComponent, child.attributes.getNamedItem(foundEvent).textContent) })
        }
        if (child.attributes.getNamedItem('(href)') !== null) {
            const pathRequested = child.attributes.getNamedItem('(href)');
            child.attributes.removeNamedItem('(href)');
            child.addEventListener('click', (event) => {
                softNavigate(child, pathRequested)
            })
        }
        if (child.children.length > 0) {
            attachChildListeners(child.children);
        }
    }
}

function createId({ name, key }: any) {
    return `${name}_${key}`
}
function createElement(template: string, data: any, styles: Style[]) {
    const element = document.createElement('div');

    if (data) {
        const componentStyles = data.styles.map((s: Style) => sass.compileString(`.${createId(data)} { ${s.stylesheet} }`).css);
        const styleElement = document.createElement('style');
        styleElement.appendChild(document.createTextNode(`${componentStyles.join('\n')}`))
        styleElement.id = `${createId(data)}_style`;
        const oldStyleElement = document.getElementById(`${createId(data)}_style`);
        if (oldStyleElement) {
            oldStyleElement.parentElement.removeChild(oldStyleElement);
        }
        document.head.appendChild(styleElement);
        template = replaceTextBetweenCurlyBraces(template);

        let renderedResult = Renderer.render(template, data, { useWith: true });
        const keys = renderedResult.match(/\[.{1,16}\]/gm)?.map((k: string) => k.replace('[', '').replace(']', ''))
        const componentsByKey = keys?.map((key: string) => ({ key: key, component: Nimble.get(key) }));
        componentsByKey?.forEach((o: { key: string, component: WebComponent }) => {
            renderedResult = renderedResult.replace(`[${o?.key}]`, createElement(o?.component?.template, o?.component, o?.component?.styles).outerHTML)
            if (o?.component) {
                Object.keys(o.component).forEach((key: string) => {
                    addPropertyObserver(o?.component, key, (...args: any[]) => {
                        o.component.refresh();
                        if ((o.component as any).onChange) {
                            (o.component as any).onChange(...args);
                        }
                    })
                })
            }
        })

        element.id = createId(data)
        element.classList.add(createId(data));
        element.innerHTML = renderedResult;
    } else {
        element.textContent = 'WebComponent implementation not found...'
    }


    return element
}

function replaceTextBetweenCurlyBraces(input: string): string {
    return input.replace(/\{\{(.*?)this\.(.*?)\}\}/g, (match, before, after) => {
        return `{{${before}component.${after}}}`;
    });
}

export class WebComponent extends Component implements WebComponentInterface {
    template = '';
    styles: Style[] = [];
    url = '';
    name = '';
    params: any[] = [];
    paramsString: any[] = [];

    element: HTMLDivElement;

    constructor(url?: string) {
        super();
        this.url = url ?? '';
        const windowSearch: any = window?.location?.search
        if (windowSearch !== '' || windowSearch.length > 0) {
            const windowSearchSplit = windowSearch?.slice(1)?.split('&');
            this.params = windowSearchSplit?.map((q: string) => { if (q) { const [name, value] = q.split('='); return { [name]: value } } }) ?? [];
            this.paramsString = windowSearchSplit?.map((q: string) => { if (q) { const [name, value] = q.split('='); return JSON.stringify({ [name]: value }) } }) ?? [];

        }
        setTimeout(() => {
            if (this.url !== '' && (window.location.pathname === `${this.url}` || this.url === '*')) {
                const componentElement = createElement(this.template, this, this.styles)
                attachChildListeners(componentElement.children)
                document.body.appendChild(componentElement)
            }

        }, 1)
    }

    navigate(path: string) {
        softNavigate(document.getElementById(createId(this)), {value: path} as Attr)
    }

    refresh() {
        const currentComponentElement = document.getElementById(createId(this));
        const newElement = createElement(this.template, this, this.styles);
        if (currentComponentElement) {
            currentComponentElement.parentElement.replaceChild(newElement, currentComponentElement);
        }
        const foundElement = document?.getElementById(createId(this));
        if (foundElement) {
            attachChildListeners(foundElement.children)
        }
        if ('routes' in this && (this.routes as any[]).length > 0) {
            const componentKeys = (this.routes as any[]).map((r: any) => r.key);
            componentKeys.forEach((k: string) => {
                setTimeout(() => {
                    Nimble.get<WebComponent>(k).refresh();
                }, 1);
            })
        }
        Object.keys(this).forEach((k: string) => {
            if (typeof (this as any)[k] === 'string') {
                if (!['currentRouteKey', 'key'].includes(k) && Nimble.hasComponent((this as any)[k]) && !('routes' in this && (this.routes as any[]).some((r) => r.key === (this as any)[k]))) {
                    Nimble.get<WebComponent>((this as any)[k]).refresh();
                }
            } else if (typeof (this as any)[k] === 'object' && 'refresh' in (this as any)[k] && Nimble.hasComponent((this as any)[k].key) && !('routes' in this && (this.routes as any[]).some((r) => r.key === (this as any)[k].key))) {
                Nimble.get<WebComponent>((this as any)[k].key).refresh();
            }
        })
    }
}