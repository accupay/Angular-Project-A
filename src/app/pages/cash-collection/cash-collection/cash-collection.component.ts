import {
  Component,
  HostBinding,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

import {Observable} from 'rxjs';
import { FormControl, FormGroup, Validators, ValidatorFn,AbstractControl,FormGroupDirective, NgForm } from "@angular/forms";
import {map, startWith} from 'rxjs/operators';
 


function autocompleteStringValidator(validOptions: Array<string>): ValidatorFn {
  // debugger;
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null  /* valid option selected */
    }
    return { 'invalidAutocompleteString': { value: control.value } }
  }
}

interface Ibill{
  myControl:string;
  customer_no:string;

}

interface IBeneficiaryForm {
  payee_name?: string;
  mobile_no?: string;
  ifsc_code?: string;
  account_number?: string;
  bankType?: any;
  bank_ref_id?: any;
}
@Component({
  selector: "app-cash-collection",
  templateUrl: "./cash-collection.component.html",
  styleUrls: ["./cash-collection.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CashCollectionComponent implements OnInit {

  selectterms;
  collectionForm: FormGroup;
  user: Ibill;

  Billers: string[] =[
    "Bajaj Finserv Agent",
    "OLA Auto",
    "HFFC Customer",
    "Reliance Retail",
    "Wheels EMI",

]


filteredOptions: Observable<string[]>;
myControl = new FormControl('',  { validators: [autocompleteStringValidator(this.Billers), Validators.required] });
  constructor() { }

  ngOnInit(): void {
    
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.initLoginForm();
  }
  public initLoginForm(): void {
  this.collectionForm = new FormGroup({

    //mobile_no: new FormControl("", [Validators.required, Validators.maxLength(10)]),
    customer_no: new FormControl("", [Validators.required]),
    myControl: new FormControl ("", [Validators.required])
    
    
  });
}
 
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.Billers.filter(option => option.toLowerCase().includes(filterValue));
  }
  
  submitbill() {
  //  debugger;
   this.user = this.collectionForm.value;
    console.log(this.myControl.value)
    console.log(this.user.customer_no)
  }
  
  



 public myError = (controlName: string, errorName: string) => {
    return this.collectionForm.controls[controlName].hasError(errorName);
  }

}
