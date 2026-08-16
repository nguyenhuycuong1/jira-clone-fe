import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NgStyle } from '@angular/common';
import { deriveBrandScale } from '../../core/theme/theme.service';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  templateUrl: './app-button.component.html',
  styleUrls: ['./app-button.component.scss'],
  imports: [NzIconDirective, NzSpinComponent, NgStyle],
})
export class AppButtonComponent implements OnInit {
  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled = false;
  @Input() rounded: boolean = false;
  @Input() leftIcon?: string;
  @Input() rightIcon?: string;
  @Input() iconOnly?: string;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() backgroundColor?: string;
  @Input() type: string = 'button'
  @Input() tabindex: string | number = ''

  protected buttonStyle: { [key: string]: string } = {};

  @HostBinding('style.width')
  get hostWidth(): string | null {
    return this.fullWidth ? '100%' : null;
  }

  ngOnInit() {
    if (this.backgroundColor) {
      const scale = deriveBrandScale(this.backgroundColor);

      this.buttonStyle = {
        '--brand': scale['--brand-500'],
        '--brand-hover': scale['--brand-600'],
        '--brand-active': scale['--brand-700'],
        '--on-brand': '#fff',
      };
    }
  }
}
