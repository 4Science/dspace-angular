import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { hasValue } from '../empty.util';

export enum SwitchColor {
  Primary = 'primary',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
}

export interface SwitchOption {
  value: any;
  icon?: string;
  iconColor?: SwitchColor;
  label?: string;
  labelColor?: SwitchColor;
  backgroundColor?: SwitchColor;
}

@Component({
  selector: 'ds-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
})
export class SwitchComponent implements OnInit, OnChanges {
  /**
   * The "on" / active option configuration
   */
  @Input() checkedOption: SwitchOption;

  /**
   * The "off" / inactive option configuration
   */
  @Input() uncheckedOption: SwitchOption;

  /**
   * The currently selected value
   */
  @Input() selectedValue: any;

  /**
   * Event emitted when the selected value changes
   */
  @Output() selectedValueChange = new EventEmitter<any>();

  /**
   * BG style of the currently selected option
   */

  public backgroundClass: string;

  /**
   * Whether the switch is currently in the "on" state
   */
  get isOn(): boolean {
    return this.selectedValue === this.checkedOption?.value;
  }

  /**
   * The currently active option based on selectedValue
   */
  get activeOption(): SwitchOption | undefined {
    if (this.selectedValue === this.checkedOption?.value) {
      return this.checkedOption;
    }
    if (this.selectedValue === this.uncheckedOption?.value) {
      return this.uncheckedOption;
    }
    return undefined;
  }

  ngOnInit() {
    this.backgroundClass = this.getBackgroundColorClass();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((hasValue(changes?.selectedValue?.currentValue) && !changes.selectedValue.isFirstChange())
        || (hasValue(changes?.checkedOption?.currentValue) && !changes.checkedOption.isFirstChange())
        || (hasValue(changes?.uncheckedOption?.currentValue) && !changes.uncheckedOption.isFirstChange())) {
      this.backgroundClass = this.getBackgroundColorClass();
    }
  }

  /**
   * Toggle between on and off values
   */
  onToggle() {
    const newValue = this.isOn ? this.uncheckedOption.value : this.checkedOption.value;
    this.selectedValue = newValue;
    this.selectedValueChange.emit(this.selectedValue);
    this.backgroundClass = this.getBackgroundColorClass();
  }

  /**
   * Returns the background color class based on the selected value.
   * Defaults to 'bg-default' if no specific color is set.
   */
  getBackgroundColorClass(): string {
    const active = this.activeOption;
    if (active?.backgroundColor) {
      return `bg-${active.backgroundColor}`;
    }
    return 'bg-default';
  }

}
