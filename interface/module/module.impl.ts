import { Component } from "../component/base/component.impl";

export class Module extends Component {
    components: {url?: string, component: any, key: string}[] = [];
    services: any[] = [];

    constructor() {
        super();
        setTimeout(() => {
            this.services.forEach((s) => {
                new s();
            })
            this.components.forEach((c, index) => {
                const comp = new c.component(c.url);
                this.components.at(index).key = comp.key
            })
        })
    }
}