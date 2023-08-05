import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Observable } from "rxjs";
import { CommonService } from "src/app/shared/services/common.service";

@Component({
  selector: "app-bene-transaction-receipt",
  templateUrl: "./bene-transaction-receipt.component.html",
  styleUrls: ["./bene-transaction-receipt.component.scss"],
})
export class beneTransactionReceiptComponent implements OnInit {
  beneTransactionDetails: any;
  myImage!: Observable<any>;
  headerIconbase64codeImage = "";

  constructor(
    public activeModal: NgbActiveModal,
    private commonService: CommonService
  ) {}
  ngOnInit() {
    this.commonService.filetoBase64("assets/images/icon.png", (data) => {
      this.fetchHeaderIconBase64(data);
    });
  }

  fetchHeaderIconBase64(data: any) {
    this.headerIconbase64codeImage = data;
  }

  print(print: any) {
    const doc = new jsPDF();
    // Logo Image
    var imgData = this.headerIconbase64codeImage;
    doc.addImage(imgData, "PNG", 10, 10, 10, 10);
    // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    // Header title
    doc.setFontSize(11);
    doc.setTextColor(40);
    // doc.setLineWidth(50);
    doc.text(
      "Transaction Details : " + this.beneTransactionDetails?.transaction_date,
      25,
      15
    );

    autoTable(doc, {
      head: [
        [
          "Transaction ID",
          "#" + this.beneTransactionDetails?.transaction_id != "" &&
          this.beneTransactionDetails?.transaction_id != "undefined"
            ? this.beneTransactionDetails?.transaction_id
            : "-",
        ],
      ],
      margin: { top: 25 },
      tableWidth:80,
      body: [
        ["Sender Name", this.beneTransactionDetails?.sender_name],
        [
          "Sender Mobile Number",
          this.beneTransactionDetails?.sender_mobile_number,
        ],
        ["Beneficiary Name", this.beneTransactionDetails?.beneficiary_name],
        ["Amount ", this.beneTransactionDetails?.amount],
        // ["Total Amount ", this.beneTransactionDetails?.total_amount],
        ["Bank", this.beneTransactionDetails?.bank_name],
        ["Account Number", this.beneTransactionDetails?.account_number],
        ["IFSC. Code", this.beneTransactionDetails?.ifsc_code],
        // ["Agent Ref ID", this.beneTransactionDetails?.agent_ref_id],
        // ["Commission ", this.beneTransactionDetails?.commision],
        [
          "Payment Mode ",
          this.beneTransactionDetails?.pay_mode_ref_id === "1"
            ? "IMPS"
            : "NEFT",
        ],
        ["RRN No", this.beneTransactionDetails?.rrn_no ? this.beneTransactionDetails?.rrn_no : '-'],
        ["Retailer Name", this.beneTransactionDetails?.retailer_name],
        ["Retailer Number", this.beneTransactionDetails?.retailer_number ? this.beneTransactionDetails?.retailer_number : this.beneTransactionDetails.agent_mobile],
        ["Transaction Status", this.beneTransactionDetails?.transaction_status],
      ],
      didDrawPage: function (data) {
        // Header
      },
    });
    const fileName =
      "transaction_" + this.beneTransactionDetails?.transaction_id;
    if (print == "1") {
      doc.autoPrint();
      doc.output("dataurlnewwindow");
    } else {
      doc.save(fileName);
    }

    return;
  }

  close() {
    this.activeModal.close(false);
  }
}
