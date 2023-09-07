import { Component } from "./interface/component/base/component.impl";

export class Nimble {

    constructor(modules: any[] = []) {
        console.log("Starting Nimble...\n")
        modules.forEach(m => new m())
    }
    static map: { [key: string]: Component } = {};
    static get<T>(key: string): T {
        if (Nimble.map[key]) {
            return Nimble.map[key] as T
        }
        return null;
    }
    static register(component: Component) {
        Nimble.map[component.key] = component;
    }
    static hasComponent(key: string) {
        return !!Nimble.get(key);
    }
}
