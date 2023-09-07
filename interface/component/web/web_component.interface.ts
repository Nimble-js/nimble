import { Style } from "./style";

export interface WebComponentInterface {
    template: string;
    styles: Style[];
    url: string;
    name: string;
}