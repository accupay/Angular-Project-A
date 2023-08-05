import { NgModule } from "@angular/core";
import { NumericDecimalDirective } from "./only-number-decimal.directive";
import { BlockCopyPasteDirective } from "./copy-past-disable.directive";

@NgModule({
  declarations: [NumericDecimalDirective, BlockCopyPasteDirective],
  exports: [NumericDecimalDirective, BlockCopyPasteDirective],
})
export class NumberAcceptModule {}
