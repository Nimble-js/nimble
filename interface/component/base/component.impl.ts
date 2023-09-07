import { Nimble } from "./../../../index";
import { ComponentInterface } from "./component.interface";

export class Component implements ComponentInterface {
    key = Math.random().toString(36).slice(2)
    constructor() {

        Nimble.register(this);
        setTimeout(() => {
            this.initialize();
        }, 5);
    }

    initialize() {
    }

    toString(): string {
        return JSON.stringify(this);
    }


}