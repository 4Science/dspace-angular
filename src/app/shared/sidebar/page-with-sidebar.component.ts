import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { pushInOut } from '../animations/push';
import { HostWindowService } from '../host-window.service';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'ds-page-with-sidebar',
  styleUrls: ['./page-with-sidebar.component.scss'],
  templateUrl: './page-with-sidebar.component.html',
  animations: [pushInOut],
  standalone: true,
  imports: [
    AsyncPipe,
    NgTemplateOutlet,
    NgIf,
    NgClass,
  ],
})
/**
 * This component takes care of displaying the sidebar properly on all viewports. It does not
 * provide default buttons to open or close the sidebar. Instead the parent component is expected
 * to provide the content of the sidebar through an input. The main content of the page goes in
 * the template outlet (inside the page-width-sidebar tags).
 */
export class PageWithSidebarComponent implements OnInit {

  /**
   * Defines whether to start as showing the filter sidebar collapsed
   */
  @Input() collapseSidebar = false;

  @Input() id: string;
  @Input() sidebarContent: TemplateRef<any>;

  /**
   * Emits true if were on a small screen
   */
  isXsOrSm$: Observable<boolean>;

  /**
   * The width of the sidebar (bootstrap columns)
   */
  @Input()
  sideBarWidth = 3;

  sidebarClasses$: Observable<string>;

  constructor(protected sidebarService: SidebarService,
              protected windowService: HostWindowService,
  ) {
  }

  ngOnInit(): void {
    this.isXsOrSm$ = this.windowService.isXsOrSm();
    this.isXsOrSm$.subscribe( isMobile => {
      if (!isMobile && !this.collapseSidebar) {
        this.openSidebar();
      } else {
        this.closeSidebar();
      }
    });

    this.sidebarClasses$ = this.isSidebarCollapsed().pipe(
      map((isCollapsed) => isCollapsed ? '' : 'active'),
    );
  }

  /**
   * Check if the sidebar is collapsed
   * @returns {Observable<boolean>} emits true if the sidebar is currently collapsed, false if it is expanded
   */
  isSidebarCollapsed(): Observable<boolean> {
    return this.sidebarService.isCollapsed;
  }

  /**
   * Check if the sidebar is collapsed
   * @returns {Observable<boolean>} emits true if the sidebar is currently collapsed, false if it is expanded
   */
  isSidebarCollapsedXL(): Observable<boolean> {
    return this.sidebarService.isCollapsedInXL;
  }

  /**
   * Set the sidebar to a collapsed state
   */
  public closeSidebar(): void {
    this.sidebarService.collapse();
  }

  /**
   * Set the sidebar to an expanded state
   */
  public openSidebar(): void {
    this.sidebarService.expand();
  }

}
