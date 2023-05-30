import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml, SafeStyle, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: "sanitize"
})
export class SanitizePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer){}

    public transform(value: any, type?: string): SafeHtml | SafeStyle | SafeUrl | SafeResourceUrl {
        switch(type){
            case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
            case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
            case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
            case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
            case 'resourceURL': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
            default: return this.sanitizer.bypassSecurityTrustHtml(value);
        }
    }
}