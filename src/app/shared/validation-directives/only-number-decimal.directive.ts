import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
  selector: "[Decimalnumeric]",
})
export class NumericDecimalDirective {
  @Input("numericType") numericType: string; // number | decimal
  @Input("maxVal") maxVal: number;

  private regex = {
    number: new RegExp(/^\d+$/),
    decimal: new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g),
    letter: new RegExp(/^[a-z][a-z\s]*$/),
    range: new RegExp(/[0-5]/),
    alpha: new RegExp(/^[a-zA-Z\s]*$/),
    alphaNumeric: new RegExp(/^[a-zA-Z0-9]*$/), // without spaces
    numberLetter: new RegExp(/^$|^[a-zA-Z0-9]+$/), // with spaces
    // allow consecutive decimals
    // decimal: new RegExp(/^[0-9]*\.?[0-9]*$/g)
    // decimal: new RegExp(/^[0-9]+\.[0-9]{2}$|[0-9]+\.[0-9]{2}[^0-9]/)
  };
  private specialKeys = {
    number: ["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"],
    decimal: ["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"],
    letter: [
      "Backspace",
      "Tab",
      "End",
      "Home",
      "ArrowLeft",
      "ArrowRight",
      "WhiteSpace",
    ],
    range: ["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"],
    alpha: ["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"],
    alphaNumeric: [
      "Backspace",
      "Tab",
      "End",
      "Home",
      "ArrowLeft",
      "ArrowRight",
    ],
  };

  constructor(private el: ElementRef) {}

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys[this.numericType].indexOf(event.key) !== -1) {
      return;
    }
    if (
      [46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (event.keyCode === 65 && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+C
      (event.keyCode === 67 && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+V
      (event.keyCode === 86 && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+X
      (event.keyCode === 88 && (event.ctrlKey || event.metaKey)) ||
      // Allow: home, end, left, right
      (event.keyCode >= 35 && event.keyCode <= 39)
    ) {
      // let it happen, don't do anything
      return;
    }
    // Do not use event.keycode this is deprecated.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex[this.numericType])) {
      event.preventDefault();
    }
  }
}
