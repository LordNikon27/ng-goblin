import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { DecimalPipe } from '@angular/common';
import { Health } from '../../services/health';

@Component({
  selector: 'app-workspace',
  imports: [
    NzButtonModule, NzIconModule, NzLayoutModule, NzSplitterModule, NzTooltipModule, DecimalPipe
  ],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Workspace implements OnInit {
private readonly healthService = inject(Health);
private readonly destroyRef = inject(DestroyRef);

protected readonly backendStatus = signal<
  'connecting' | 'ready' | 'unavailable'
>('unavailable');

protected readonly backendVersion = signal<string | null>(null);

ngOnInit(): void {
  this.checkBackendHealth();
}

protected checkBackendHealth(): void {

  if (this.backendStatus() === 'connecting') {
    return;
  }

  this.backendStatus.set('connecting');

  this.healthService
    .getHealth()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: response => {
        this.backendVersion.set(response.version);

        this.backendStatus.set(
          response.status === 'ready'
            ? 'ready'
            : 'unavailable'
        );
      },
      error: () => {
        this.backendVersion.set(null);
        this.backendStatus.set('unavailable');
      }
    });
}

 protected inspectorVisible = true;

  protected terminalExpanded = false;

  /**
   * Dimensione effettivamente applicata al pannello terminale.
   * Un valore numerico viene interpretato da NG-ZORRO come pixel.
   */
  protected terminalSize = 38;

  /**
   * Ultima altezza scelta mentre il terminale era aperto.
   * Viene riutilizzata alla successiva apertura.
   */
  protected lastExpandedTerminalSize = 260;

  protected readonly terminalCollapsedSize = 38;
  protected readonly terminalMinimumExpandedSize = 160;

  protected toggleInspector(): void {
    this.inspectorVisible = !this.inspectorVisible;
  }

  protected toggleTerminal(): void {
    if (this.terminalExpanded) {
      this.collapseTerminal();
      return;
    }

    this.expandTerminal();
  }

  protected expandTerminal(): void {
    this.terminalExpanded = true;

    this.terminalSize = Math.max(
      this.lastExpandedTerminalSize,
      this.terminalMinimumExpandedSize
    );
  }

  protected collapseTerminal(): void {
    if (
      this.terminalSize >=
      this.terminalMinimumExpandedSize
    ) {
      this.lastExpandedTerminalSize =
        this.terminalSize;
    }

    this.terminalExpanded = false;
    this.terminalSize = this.terminalCollapsedSize;
  }

  /**
   * Viene chiamato mentre l'utente trascina lo splitter.
   *
   * Il secondo elemento dell'array corrisponde al pannello inferiore,
   * cioè al terminale.
   */
  protected onTerminalResize(
    panelSizes: number[]
  ): void {
    const resizedTerminalSize = panelSizes[1];

    if (resizedTerminalSize === undefined) {
      return;
    }

    this.terminalSize = resizedTerminalSize;

    if (
      resizedTerminalSize >
      this.terminalCollapsedSize
    ) {
      this.terminalExpanded = true;
    }
  }

  /**
   * Al termine del trascinamento normalizziamo la dimensione.
   */
  protected onTerminalResizeEnd(
    panelSizes: number[]
  ): void {
    const resizedTerminalSize = panelSizes[1];

    if (resizedTerminalSize === undefined) {
      return;
    }

    /*
     * Se l'utente trascina il terminale quasi completamente verso
     * il basso, lo chiudiamo in modo netto a 38 px.
     */
    if (
      resizedTerminalSize <
      this.terminalMinimumExpandedSize
    ) {
      this.collapseTerminal();
      return;
    }

    this.terminalExpanded = true;
    this.terminalSize = resizedTerminalSize;
    this.lastExpandedTerminalSize =
      resizedTerminalSize;
  }
}
