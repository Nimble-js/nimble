export class Style {

    path: string;
    stylesheet: string;
    other: string;
 
    constructor(style?: any) {
        if (style) {
            const [path, stylesheet, other] = style[0];
            this.path = path;
            this.stylesheet = stylesheet;
            this.other = other;
        }
    }

    static parse(styleText: string) {
        const newStyle = new Style();
        newStyle.path = 'local';
        newStyle.stylesheet = styleText;
        newStyle.other = 'code-origination';
        return newStyle;
    }

}