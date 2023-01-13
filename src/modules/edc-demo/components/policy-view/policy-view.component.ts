import {Component, OnInit} from '@angular/core';
import {PolicyDefinition, PolicyService} from "../../../edc-dmgmt-client";
import {BehaviorSubject, Observable, of} from "rxjs";
import {first, map, switchMap} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {NewPolicyDialogComponent} from "../new-policy-dialog/new-policy-dialog.component";
import {NotificationService} from "../../services/notification.service";
import {ConfirmationDialogComponent, ConfirmDialogModel} from "../confirmation-dialog/confirmation-dialog.component";
import {NewPolicyDialogResult} from "../new-policy-dialog/new-policy-dialog-result";

@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.scss']
})
export class PolicyViewComponent implements OnInit {

  filteredPolicies$: Observable<PolicyDefinition[]> = of([]);
  searchText: string = '';
  private fetch$ = new BehaviorSubject(null);

  constructor(
    private policyService: PolicyService,
    private notificationService: NotificationService,
    private readonly dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.filteredPolicies$ = this.fetch$.pipe(
      switchMap(() => {
        const contractDefinitions$ = this.policyService.getAllPolicies();
        return !!this.searchText ?
          contractDefinitions$.pipe(map(policies => policies.filter(policy => this.isFiltered(policy, this.searchText))))
          :
          contractDefinitions$;
      }));
  }

  onSearch() {
    this.refresh();
  }

  onCreate() {
    const dialogRef = this.dialog.open(NewPolicyDialogComponent)
    dialogRef.afterClosed().pipe(first()).subscribe((result: NewPolicyDialogResult) => {
      if (result.refreshList) {
        this.refresh();
      }
    })
  }

  private refresh() {
    this.fetch$.next(null);
  }

  /**
   * simple full-text search - serialize to JSON and see if "searchText"
   * is contained
   */
  private isFiltered(policy: PolicyDefinition, searchText: string) {
    return JSON.stringify(policy).includes(searchText);
  }

  delete(policy: PolicyDefinition) {
    const dialogData = ConfirmDialogModel.forDelete("policy", policy.id);
    const ref = this.dialog.open(ConfirmationDialogComponent, {maxWidth: '20%', data: dialogData});
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.policyService.deletePolicy(policy.id).subscribe({
          complete: () => {
            this.fetch$.next(null)
            this.notificationService.showInfo("Successfully deleted policy.")
          },
          error: err => {
            console.error(err)
            this.notificationService.showError('Failed deleting policy.');
          },
        });
      }
    });
  }

  id(x: any): string {
    return x?.id || x?.uid;
  }
}
