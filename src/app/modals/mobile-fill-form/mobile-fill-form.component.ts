import { Component, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';
import { AdvisedTreatment } from 'src/app/models/AdvisedTreatment';
import { Form } from 'src/app/models/Form';
import { HairState } from 'src/app/models/HairState';
import { Product } from 'src/app/models/Product';
import { APIService } from 'src/app/services/api/api.service';
import { FileUploader, FileItem, FileLikeObject } from 'ng2-file-upload';
import { ImageViewerConfig } from 'ngx-image-viewer';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { InfoSnackBarComponent } from 'src/app/partials/info-snack/info-snack.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Observable, from, lastValueFrom } from 'rxjs';
import { isEmpty } from 'lodash';
import { AfterViewInit } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { ViewClientAssocFormsComponent } from './micro-components/view-client-assoc-forms/view-client-assoc-forms.component';


export class TemplateProductInForm {
  product_ref_id?: number
  product_name?: string
  product_description?: string
}

@Component({
  selector: 'app-mobile-fill-form',
  templateUrl: './mobile-fill-form.component.html',
  styleUrls: ['./mobile-fill-form.component.scss'],
})
export class MobileFillFormComponent implements OnInit, AfterViewInit {
  public _selfParentElement?: HTMLElement
  public _modalBackdrop?: HTMLElement

  public componentTitle = Default_PT.FILLING_FORM
  public formId: number = 0
  public formData?: Form
  public controlGroup!: FormGroup
  public tOptionLoaded?: boolean
  public addedProductList: TemplateProductInForm[] = []
  public addProductBtnText = Default_PT.ADD_PRODUCT_BTN_TEXT
  public removeProductBtnText = Default_PT.REMOVE_PRODUCT_BTN_TEXT
  public addProductPlaceholderText = Default_PT.ADD_PRODUCT_PLACEHOLDER_TEXT
  public emptyProductBoilerplateText = Default_PT.EMPTY_PRODUCT_DESC_TEXT

  public leftShiftedModal: boolean = false

  public loadingImage: boolean = false

  public imgArray: string[] = []
  public uploader: FileUploader = new FileUploader({ url: '' });

  public treatmentOptions?: AdvisedTreatment[]

  public hOptionsLoaded?: boolean
  public hairStateOptions?: HairState[]

  public pOptionsLoaded?: boolean
  public productOptions?: Product[]

  public viewerConfig: ImageViewerConfig = {
    btnClass: 'default',
    zoomFactor: 0,
    containerBackgroundColor: '#fff',
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: false,
    btnIcons: {
      fullscreen: 'w-[10px] h-[10px]',
    },
    btnShow: {
      zoomIn: false,
      zoomOut: false,
      rotateClockwise: false,
      rotateCounterClockwise: false,
      next: false,
      prev: false,
    },
  }

  constructor(
    private formBuilder: FormBuilder,
    public modalController: ModalController,
    public api: APIService,
    params: NavParams,
    private renderer: Renderer2,
    public _snackBar: MatSnackBar,
    private appRef: ApplicationRef,
    private imageCompress: NgxImageCompressService) {
    this.formId = params.data['form_id']

    this.controlGroup = this.formBuilder.group({
      observations: ['', [Validators.minLength(5), Validators.maxLength(250), Validators.pattern(/^\S(.*\S)?$/)]],
      client_objective: ['', [Validators.minLength(5), Validators.maxLength(250), Validators.pattern(/^\S(.*\S)?$/)]],
      hair_states: [[]],
      selected_product: [undefined],
      selected_product_description: ['', [Validators.minLength(2), Validators.maxLength(250), Validators.pattern(/^\S(.*\S)?$/)]]
    });

    this.uploader._fileTypeFilter = (item: FileLikeObject) => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png']
      const fileExtension = item.name?.split('.').pop()
      return allowedExtensions.includes(fileExtension!)
    };

    this.uploader._mimeTypeFilter = (item: FileLikeObject) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
      return allowedMimeTypes.includes(item.type!)
    };

    this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']

      if (allowedMimeTypes.includes(fileItem._file.type)) {
        if (this.uploader.queue.length <= 4) {
          this.readFile(fileItem._file, async (result: string) => {
            this.loadingImage = true
            if (Math.floor((result.length * 0.75) / 1024) >= (4 * 1024)) {
              console.log("Original image size : " + Math.floor((result.length * 0.75) / 1024))
              let compressedResult = await lastValueFrom(this.compressImage(result))
              console.log("Compressed image size : " + Math.floor((compressedResult.length * 0.75) / 1024))

              if (isEmpty(compressedResult)) {
                this.uploader.removeFromQueue(fileItem)
                this.openInfoSnackBar(Default_PT.ERROR_COMPRESSING_FILE, Default_PT.INFO_BTN)
              } else {
                this.imgArray.push(compressedResult)
              }
            } else {
              this.imgArray.push(result)
            }

            this.loadingImage = false
          })
        } else {
          this.uploader.removeFromQueue(fileItem)
          this.openInfoSnackBar(Default_PT.MAXIUM_IMAGE_AMOUNT_REACHED, Default_PT.INFO_BTN)
        }
      } else {
        this.uploader.removeFromQueue(fileItem)
        this.openInfoSnackBar(Default_PT.INVALID_FILE_TYPE, Default_PT.INFO_BTN)
      }
    }

    this.controlGroup.get('hair_states')!.valueChanges.subscribe((values: HairState[]) => {
      if (values.length > 0) {
        let lastEl = values[values.length - 1]
        const duplicateIndex = values.findIndex((v, i) => v.subcategory === lastEl.subcategory && i != (values.length - 1))

        if (duplicateIndex !== -1) {
          values.splice(duplicateIndex, 1)
          this.controlGroup.patchValue({ hair_states: values }, { emitEvent: false })
        }
      }
    })
  }

  ngAfterViewInit(): void {
    this._selfParentElement = document.querySelector('app-mobile-fill-form')?.parentElement as HTMLElement
    this._modalBackdrop = this._selfParentElement.shadowRoot?.querySelector('ion-backdrop') as HTMLElement
  }

  openFormsToTheSide() {
    if (!isEmpty(this._selfParentElement) && !isEmpty(this._modalBackdrop)) {
      this.renderer.setStyle(this._selfParentElement, 'width', 'calc(100% + 25vw)')
      this.renderer.setStyle(this._selfParentElement, 'transform', 'translateX(-12.5vw)')
      this.renderer.addClass(this._selfParentElement, 'shift-left')

      let rootViewRef = this.getRootViewContainerRef()
      rootViewRef.createComponent(ViewClientAssocFormsComponent)

    } else {
      this.openInfoSnackBar(Default_PT.COULD_NOT_GET_FORMS, Default_PT.INFO_BTN)
    }
  }

  removeAttachment(img: string) {
    let idx = this.imgArray.findIndex((i) => { return i === img })

    if (idx != -1) {
      this.imgArray.splice(idx, 1)
      this.uploader.queue.splice(idx, 1)
    }
  }

  removeFromAddedProductList(prod: TemplateProductInForm) {
    this.addedProductList.splice(this.addedProductList.findIndex((i) => { return i.product_ref_id === prod.product_ref_id }), 1)
  }

  compressImage(base64Image: string): Observable<string> {
    const targetSizeInBytes = 4 * 1024;

    let quality = 100;
    let step = 5;
    let maxIterations = 10;

    let compressedImage: string = base64Image;
    let iterations = 0;

    return from(new Promise<string>((resolve, reject) => {
      const compressIteration = () => {
        this.imageCompress.compressFile(compressedImage, -1, quality, quality).then(
          result => {
            compressedImage = result;
            const compressedSizeInBytes = Math.floor((compressedImage.length * 0.75) / 1024);

            if (compressedSizeInBytes > targetSizeInBytes && quality >= step && iterations < maxIterations) {
              quality -= step;
              iterations++;
              compressIteration();
            } else {
              resolve(compressedImage);
            }
          }
        ).catch(error => reject(''));
      };

      compressIteration();
    }));
  }

  ngOnInit(): void {
    this.fecthFormData()
  }

  private readFile(file: File, callback: (result: string) => void) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      callback(event.target.result);
    };

    reader.readAsDataURL(file);
  }

  async fecthFormData() {
    this.api.getForm(this.formId).subscribe((wrapper) => {
      let templateData = wrapper.data

      if (templateData.is_singleton) {
        this.formData = templateData
      } else {
        templateData.service = { ...templateData.treatment_sequence?.treatment?.service }
        templateData.client = { ...templateData.treatment_sequence?.treatment?.client }

        // no need for deepClone
        this.formData = templateData
      }

      if (this.formData.has_advised_treatment) {
        this.loadAdvisedTreatments()
      }

      if (this.formData.has_hair_state) {
        this.loadHairStates()
      }

      if (this.formData.has_product_list) {
        this.loadProducts()
      }
    })
  }


  getRootViewContainerRef(): ViewContainerRef {
    const appInstance = this.appRef.components[0].instance;

    if (!appInstance.viewContainerRef) {
      const appName = this.appRef.componentTypes[0].name;
      throw new Error(`Missing 'viewContainerRef' declaration in ${appName} constructor`);
    }

    return appInstance.viewContainerRef;
  }

  async loadAdvisedTreatments() {
    this.api.getAllAdvisedTreatments().subscribe((wrapper) => {
      this.treatmentOptions = wrapper.data
      this.tOptionLoaded = true
    })
  }

  async loadHairStates() {
    this.api.getAllHairStates().subscribe((wrapper) => {
      this.hairStateOptions = wrapper.data
      this.hOptionsLoaded = true
    })
  }

  async loadProducts() {
    this.api.getAllProducts().subscribe((wrapper) => {
      this.productOptions = wrapper.data
      this.pOptionsLoaded = true
    })
  }

  openInfoSnackBar(content: string, btnContent: string) {
    const config = new MatSnackBarConfig();
    config.data = { content: content, btnContent: btnContent, duration: 3000 };
    this._snackBar.openFromComponent(InfoSnackBarComponent, config);
  }

  addToAddedProductList() {
    let desc = this.controlGroup.get('selected_product_description')?.value
    let prod = this.controlGroup.get('selected_product')?.value

    this.addedProductList.push(
      {
        product_ref_id: prod.id,
        product_name: prod.product_name,
        product_description: desc,
      }
    )

    this.controlGroup.patchValue({ selected_product_description: '', selected_product: undefined })
    this.controlGroup.get('selected_product_description')?.markAsUntouched()
    this.controlGroup.get('selected_product')?.markAsUntouched()
  }
}
