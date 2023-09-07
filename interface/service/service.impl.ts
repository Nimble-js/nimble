import { Component } from "../component/base/component.impl";

export class Service extends Component {
    static instance: any;

    static getInstance() {
        return this.instance;
    }

    constructor() {
        super();
        Service.instance = this;
    }
}