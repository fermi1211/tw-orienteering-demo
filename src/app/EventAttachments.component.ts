import {ScreenDialog} from './screen-dialog.component';
import {IconComponent} from './icons.component';
import {mediaPolicy} from '../media-policy.js';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { Images, UploadSimple, FileText, DownloadSimple, Trash, MagnifyingGlassPlus, CaretLeft, CaretRight } from './icon-symbols';
const empty: any = {
  images: [],
  documents: []
};
export const fileSize: any = (bytes: any) => bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
@Component({selector:'demo-image-tile',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent, FormValue],host:{style:'display: contents'},templateUrl:'./EventAttachments.ImageTile.html'})
export class ImageTile extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    item,
    onView,
    onRemove,
    onLabel
  } = propsValue;
  const url: any = this.fileResource(0, item.file);
  return viewOwner.fragment("fragment11", {
    v0: viewOwner.fragment("fragment3", {
      v0: () => onView(item),
      v1: `放大圖片：${item.label || item.file.name}`,
      v2: viewOwner.fragment("fragment0", {
        v0: url || undefined,
        v1: item.label || item.file.name
      }),
      v3: viewOwner.fragment("fragment2", {
        v0: viewOwner.fragment("fragment1", {
          v0: MagnifyingGlassPlus,
          v1: {
            "size": 18
          }
        })
      })
    }),
    v1: onLabel ? viewOwner.fragment("fragment5", {
      v0: viewOwner.fragment("fragment4", {
        v0: item.label,
        v1: 120,
        v2: (event: any) => onLabel(event.target.value)
      })
    }) : viewOwner.fragment("fragment6", {
      v0: item.label || item.file.name
    }),
    v2: onRemove && viewOwner.fragment("fragment10", {
      v0: viewOwner.fragment("fragment7", {
        v0: fileSize(item.file.size)
      }),
      v1: viewOwner.fragment("fragment9", {
        v0: onRemove,
        v1: `移除圖片：${item.file.name}`,
        v2: viewOwner.fragment("fragment8", {
          v0: Trash,
          v1: {
            "size": 17
          }
        })
      })
    })
  });
}
}

@Component({selector:'demo-document-tile',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./EventAttachments.DocumentTile.html'})
export class DocumentTile extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    item,
    onRemove
  } = propsValue;
  const url: any = this.fileResource(0, item.file);
  return viewOwner.fragment("fragment9", {
    v0: viewOwner.fragment("fragment0", {
      v0: FileText,
      v1: {
        "size": 28
      }
    }),
    v1: viewOwner.fragment("fragment3", {
      v0: viewOwner.fragment("fragment1", {
        v0: item.file.name
      }),
      v1: viewOwner.fragment("fragment2", {
        v0: item.file.name.split('.').pop().toUpperCase(),
        v1: fileSize(item.file.size)
      })
    }),
    v2: onRemove ? viewOwner.fragment("fragment5", {
      v0: onRemove,
      v1: `移除檔案：${item.file.name}`,
      v2: viewOwner.fragment("fragment4", {
        v0: Trash,
        v1: {
          "size": 20
        }
      })
    }) : viewOwner.fragment("fragment8", {
      v0: url || undefined,
      v1: item.file.name,
      v2: `下載 ${item.file.name}`,
      v3: viewOwner.fragment("fragment6", {
        v0: DownloadSimple,
        v1: {
          "size": 20
        }
      }),
      v4: viewOwner.fragment("fragment7", {})
    })
  });
}
}

@Component({selector:'demo-full-image',standalone:true,imports:[ViewFragmentComponent, ViewAnchor],host:{style:'display: contents'},templateUrl:'./EventAttachments.FullImage.html'})
export class FullImage extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    item
  } = propsValue;
  const url: any = this.fileResource(0, item.file);
  return viewOwner.fragment("fragment2", {
    v0: viewOwner.fragment("fragment0", {
      v0: url || undefined,
      v1: item.label || item.file.name
    }),
    v1: viewOwner.fragment("fragment1", {
      v0: item.label || item.file.name
    })
  });
}
}

@Component({selector:'demo-event-hero',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./EventAttachments.EventHero.html'})
export class EventHero extends ViewController {
private _state_selected:any; private _ready_selected=false;
private setSelected=(next:any)=>{const value=typeof next==='function'?next(this._state_selected):next;if(!Object.is(value,this._state_selected)){this._state_selected=value;this.update();}};
private _state_viewing:any; private _ready_viewing=false;
private setViewing=(next:any)=>{const value=typeof next==='function'?next(this._state_viewing):next;if(!Object.is(value,this._state_viewing)){this._state_viewing=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    images = [],
    Dialog
  } = propsValue;
  if (!this._ready_selected) {
    const stateInitial: any = 0;
    this._state_selected = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_selected = true;
  }
  const selected: any = this._state_selected;
  const setSelected: any = this.setSelected;
  if (!this._ready_viewing) {
    const stateInitial: any = false;
    this._state_viewing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_viewing = true;
  }
  const viewing: any = this._state_viewing;
  const setViewing: any = this.setViewing;
  const index: any = Math.min(selected, images.length - 1),
    item: any = images[index];
  if (!item) return null;
  return viewOwner.fragment("fragment11", {
    v0: viewOwner.fragment("fragment0", {
      v0: HeroImage,
      v1: {
        "item": item,
        "onView": () => setViewing(true)
      }
    }),
    v1: viewOwner.fragment("fragment8", {
      v0: viewOwner.fragment("fragment1", {
        v0: item.label || '主辦單位提供圖片'
      }),
      v1: images.length > 1 && viewOwner.fragment("fragment7", {
        v0: viewOwner.fragment("fragment3", {
          v0: () => setSelected((index - 1 + images.length) % images.length),
          v1: viewOwner.fragment("fragment2", {
            v0: CaretLeft,
            v1: {
              "size": 20
            }
          })
        }),
        v1: viewOwner.fragment("fragment4", {
          v0: index + 1,
          v1: images.length
        }),
        v2: viewOwner.fragment("fragment6", {
          v0: () => setSelected((index + 1) % images.length),
          v1: viewOwner.fragment("fragment5", {
            v0: CaretRight,
            v1: {
              "size": 20
            }
          })
        })
      })
    }),
    v2: viewing && viewOwner.fragment("fragment10", {
      v0: Dialog,
      v1: {
        "title": "檢視活動圖片",
        "onClose": () => setViewing(false),
        "wide": true,
        children: [viewOwner.fragment("fragment9", {
          v0: FullImage,
          v1: {
            "item": item
          }
        })]
      }
    })
  });
}
}

@Component({selector:'demo-hero-image',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./EventAttachments.HeroImage.html'})
export class HeroImage extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    item,
    onView
  } = propsValue;
  const url: any = this.fileResource(0, item.file);
  return viewOwner.fragment("fragment3", {
    v0: onView,
    v1: `放大活動圖片：${item.label || item.file.name}`,
    v2: viewOwner.fragment("fragment0", {
      v0: url || undefined,
      v1: item.label || item.file.name
    }),
    v3: viewOwner.fragment("fragment2", {
      v0: viewOwner.fragment("fragment1", {
        v0: MagnifyingGlassPlus,
        v1: {
          "size": 19
        }
      })
    })
  });
}
}

@Component({selector:'demo-event-documents',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./EventAttachments.EventDocuments.html'})
export class EventDocuments extends ViewController {

protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    documents = []
  } = propsValue;
  return viewOwner.fragment("fragment5", {
    v0: viewOwner.fragment("fragment0", {}),
    v1: viewOwner.fragment("fragment1", {}),
    v2: documents.length ? viewOwner.fragment("fragment3", {
      v0: documents.map((item: any) => viewOwner.fragment("fragment2", {
        v0: DocumentTile,
        v1: {
          "key": item.id,
          "item": item
        }
      }))
    }) : viewOwner.fragment("fragment4", {})
  });
}
}

@Component({selector:'demo-event-image-gallery',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, ViewComponent],host:{style:'display: contents'},templateUrl:'./EventAttachments.EventImageGallery.html'})
export class EventImageGallery extends ViewController {
private _state_viewing:any; private _ready_viewing=false;
private setViewing=(next:any)=>{const value=typeof next==='function'?next(this._state_viewing):next;if(!Object.is(value,this._state_viewing)){this._state_viewing=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    images = [],
    Dialog
  } = propsValue;
  if (!this._ready_viewing) {
    const stateInitial: any = null;
    this._state_viewing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_viewing = true;
  }
  const viewing: any = this._state_viewing;
  const setViewing: any = this.setViewing;
  return viewOwner.fragment("fragment4", {
    v0: viewOwner.fragment("fragment1", {
      v0: images.map((item: any) => viewOwner.fragment("fragment0", {
        v0: ImageTile,
        v1: {
          "key": item.id,
          "item": item,
          "onView": setViewing
        }
      }))
    }),
    v1: viewing && viewOwner.fragment("fragment3", {
      v0: Dialog,
      v1: {
        "title": "檢視公告圖片",
        "onClose": () => setViewing(null),
        "wide": true,
        children: [viewOwner.fragment("fragment2", {
          v0: FullImage,
          v1: {
            "item": viewing
          }
        })]
      }
    })
  });
}
}

@Component({selector:'demo-event-attachments',standalone:true,imports:[ScreenDialog, IconComponent],host:{style:'display: contents'},templateUrl:'./EventAttachments.EventAttachments.html'})
export class EventAttachments extends ViewController {
 patchRowImage(id:string,label:string){this.ui.onChange({...this.ui.value,images:this.ui.images.map((item:any)=>item.id===id?{...item,label}:item)});}

 url(file:File,index:number){return this.fileResource(index,file);}
 closeImage=()=>this.ui.setViewing(null);

private _resource_id:any;
private _state_viewing:any; private _ready_viewing=false;
private setViewing=(next:any)=>{const value=typeof next==='function'?next(this._state_viewing):next;if(!Object.is(value,this._state_viewing)){this._state_viewing=value;this.update();}};
private _state_error:any; private _ready_error=false;
private setError=(next:any)=>{const value=typeof next==='function'?next(this._state_error):next;if(!Object.is(value,this._state_error)){this._state_error=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    value = empty,
    Dialog,
    editor = false,
    onChange,
    imagesOnly = false,
    imageLabel = '賽事圖片'
  } = propsValue;
  const id: any = this._resource_id ??= 'field-' + crypto.randomUUID();
  if (!this._ready_viewing) {
    const stateInitial: any = null;
    this._state_viewing = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_viewing = true;
  }
  const viewing: any = this._state_viewing;
  const setViewing: any = this.setViewing;
  if (!this._ready_error) {
    const stateInitial: any = '';
    this._state_error = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_error = true;
  }
  const error: any = this._state_error;
  const setError: any = this.setError;
  const images: any = value.images || [],
    documents: any = value.documents || [];
  function addFiles(event: any, kind: any) {
    const files: any = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const current: any = kind === 'images' ? images : documents;
    const limit: any = kind === 'images' ? mediaPolicy.maxImages : Infinity,
      maxSize: any = mediaPolicy.maxBytes;
    if (current.length + files.length > limit) {
      setError(`每場最多 ${limit} ${kind === 'images' ? '張圖片' : '份簡章檔案'}，請移除部分附件後再選擇。`);
      return;
    }
    const invalid: any = files.find((file: any) => !file.size || file.size > maxSize || (kind === 'images' ? !/^image\/(jpeg|png)$/.test(file.type) || !/\.(jpe?g|png)$/i.test(file.name) : !(/\.pdf$/i.test(file.name) && (!file.type || file.type === 'application/pdf'))));
    if (invalid) {
      setError(`「${invalid.name}」無法加入。請選擇${kind === 'images' ? '10 MB 以內的 JPG／JPEG／PNG 圖片' : '10 MB 以內的 PDF 檔案'}，且檔案不可為空。`);
      return;
    }
    setError('');
    onChange({
      ...value,
      [kind]: [...current, ...files.map((file: any) => ({
        id: crypto.randomUUID(),
        file,
        label: ''
      }))]
    });
  }
  function remove(kind: any, id: any) {
    setError('');
    onChange({
      ...value,
      [kind]: value[kind].filter((item: any) => item.id !== id)
    });
  }
  this.ui={value,Dialog,editor,onChange,imagesOnly,imageLabel,id,viewing,setViewing,error,setError,images,documents,addFiles,remove,mediaPolicy};
  return null;
}
}
