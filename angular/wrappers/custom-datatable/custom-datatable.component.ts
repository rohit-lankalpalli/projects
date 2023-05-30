import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CommonUtilService } from 'src/app/services/common-util.service';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'custom-datatable',
  templateUrl: './custom-datatable.component.html',
  styleUrls: ['./custom-datatable.component.scss']
})
export class CustomDatatableComponent implements OnInit {

  @Input("tableConfig") tableConfig: any = {
    dataSourceURL: '',
    columns: [],
    deleteURL: '',
    deleteMessage: 'Delete Successful',
    primaryKey: ''
  };

  @Input("tableData") tableData: any;

  @Input("enableOptions") enableOptions: boolean = true;

  @Input("addRowHoverClass") addRowHoverClass: boolean = false;
 

  recordCount: number = 0;

  @Output("rowClicked") rowClicked = new EventEmitter<any>();
  @Output("editClicked") editClicked = new EventEmitter<any>();
  @Output("deleteClicked") deleteClicked = new EventEmitter<any>();

  tableList: any = [];
  dataSource: any;
  displayedColums: string[] = []; // Can be changed, only contains property names list
  columnList = [];
  selectedColumns = new FormControl();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  selection = new SelectionModel<any>(true, []);

  constructor(private util: CommonUtilService) { }

  ngOnInit(): void {
    let columnLimit = 7;
    let currentColumnCount = 1;
    if (this.tableConfig) {
      this.tableConfig.columns.forEach(element => {
        const ele = element;
        if (currentColumnCount <= columnLimit) {
          ele.checked = true;
          if (currentColumnCount <= 2) {
            ele.disabled = true;
            this.columnList.push(ele);   
          } else {
            this.columnList.push(ele);   
          }
          this.displayedColums.push(element.property);    
        } else {
          ele.disabled = false;
          ele.checked = false;
          this.columnList.push(ele);
        }
        ++currentColumnCount;
      }); 
      if (this.enableOptions) {
        this.displayedColums.push('options');
      }
      this.selectedColumns.patchValue(this.displayedColums);
      this.reloadDataTable();
    }
  }

  ngOnChanges() {
    if (this.tableData && Array.isArray(this.tableData)) {
      this.dataSource = new MatTableDataSource(this.tableData);
      this.recordCount = this.tableData.length;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }


  public async reloadDataTable() {
    if (this.tableConfig.dataSourceURL) {
      this.tableList = await this.util.callGETRequest(this.tableConfig.dataSourceURL);
      this.dataSource = new MatTableDataSource(this.tableList.data);
      this.recordCount = this.tableList.count;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  rowClickedFn(element) {
    console.log("row clicked", element);
    this.rowClicked.emit(element);
  }
  editClickedFn(element) {
    this.editClicked.emit(element);
  }
  async deleteClickedFn(element) {
    // this.deleteClicked.emit(element);
    this.util.spinner.show();
    this.util.callDeleteRequest(this.tableConfig.deleteURL + element[this.tableConfig.primaryKey]).then((res: any) => {
      if (res.status == 'success') {
        this.util.toastrService.success(this.tableConfig.deleteMessage);
        this.util.spinner.hide();
        this.reloadDataTable();
      } else {
        this.util.spinner.hide();
        this.util.toastrService.error('Error while Deleting. Contact Admin');
      }
    }).catch(res=> console.error(res));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  columnSelectionChange(event) {
    let tempList = [];
    if (event && event.value) {
      this.columnList.forEach(element => {
        if (event.value.toString().indexOf(element.property) > -1) {
          tempList.push(element.property);
        }
      });
    }
    if (this.enableOptions) {
      tempList.push('options');
    }
    this.displayedColums = tempList;
  }


}
