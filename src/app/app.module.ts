import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { ButtonBarComponent } from './editor/button-bar/button-bar.component';
import { ButtonComponent } from './editor/button-bar/button/button.component';
import { OriginalImageComponent } from './editor/original-image/original-image.component';
import { EditedImageComponent } from './editor/edited-image/edited-image.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    FileExplorerComponent,
    ButtonBarComponent,
    ButtonComponent,
    OriginalImageComponent,
    EditedImageComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
