import {IconComponent} from './icons.component';
import {mediaPolicy} from '../media-policy.js';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import { Editor } from '@tiptap/core';
import { articleImageView } from './article-image-view';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { articleFonts, articleFontSizes, articleImageCount, safeArticleColor, safeArticleImage, safeArticleLink } from "../article-model.js";
import { readArticleImage } from "../article-images.js";
const ArticleImage: any = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: ''
      },
      width: {
        default: 100
      },
      align: {
        default: 'center'
      }
    };
  },
  parseHTML() {
    return [{
      tag: 'figure[data-article-image]',
      getAttrs: (element: any) => ({
        src: element.querySelector('img')?.getAttribute('src'),
        alt: element.querySelector('img')?.getAttribute('alt') || '',
        caption: element.querySelector('figcaption')?.textContent || '',
        width: Number(element.dataset.width) || 100,
        align: element.dataset.align || 'center'
      })
    }, {
      tag: 'img[src]'
    }];
  },
  renderHTML({
    node
  }) {
    const width: any = Math.max(25, Math.min(100, Number(node.attrs.width) || 100));
    return ['figure', {
      'data-article-image': '',
      'data-width': width,
      'data-align': node.attrs.align,
      style: `width:${width}%`
    }, ['img', {
      src: safeArticleImage(node.attrs.src) || '',
      alt: node.attrs.alt || ''
    }], ['figcaption', {}, node.attrs.caption || '']];
  },
  addNodeView() {
    return articleImageView;
  }
});
@Component({selector:'demo-rich-article-editor',standalone:true,imports:[IconComponent, ViewFragmentComponent, ViewAnchor, ViewComponent, FormValue, ElementBinding, EditorMount],host:{style:'display: contents'},templateUrl:'./RichArticleEditor.RichArticleEditor.html'})
export class RichArticleEditor extends ViewController {
 get imageLimit(){return mediaPolicy.maxImages;}
 toolbarIcons:any={"粗體": "text-b", "斜體": "text-italic", "底線": "text-underline", "螢光標示": "highlighter", "清除文字格式": "eraser", "項目清單": "list-bullets", "編號清單": "list-numbers", "引言": "quotes", "分割線": "minus", "靠左對齊": "text-align-left", "置中對齊": "text-align-center", "靠右對齊": "text-align-right", "加入連結": "link", "移除連結": "link-break", "復原": "arrow-u-up-left", "重做": "arrow-u-up-right"};
private _resource_upload:any;
private _resource_uploadPosition:any;
private _state_problem:any; private _ready_problem=false;
private setProblem=(next:any)=>{const value=typeof next==='function'?next(this._state_problem):next;if(!Object.is(value,this._state_problem)){this._state_problem=value;this.update();}};
private _state_busy:any; private _ready_busy=false;
private setBusy=(next:any)=>{const value=typeof next==='function'?next(this._state_busy):next;if(!Object.is(value,this._state_busy)){this._state_busy=value;this.update();}};
private _state_linkDialog:any; private _ready_linkDialog=false;
private setLinkDialog=(next:any)=>{const value=typeof next==='function'?next(this._state_linkDialog):next;if(!Object.is(value,this._state_linkDialog)){this._state_linkDialog=value;this.update();}};
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    initialContent,
    onChange,
    onBusyChange,
    Dialog
  } = propsValue;
  const upload: any = this._resource_upload ??= {
      current: null
    },
    uploadPosition: any = this._resource_uploadPosition ??= {
      current: 0
    };
  if (!this._ready_problem) {
    const stateInitial: any = '';
    this._state_problem = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_problem = true;
  }
  const problem: any = this._state_problem;
  const setProblem: any = this.setProblem;
  if (!this._ready_busy) {
    const stateInitial: any = false;
    this._state_busy = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_busy = true;
  }
  const busy: any = this._state_busy;
  const setBusy: any = this.setBusy;
  if (!this._ready_linkDialog) {
    const stateInitial: any = null;
    this._state_linkDialog = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_linkDialog = true;
  }
  const linkDialog: any = this._state_linkDialog;
  const setLinkDialog: any = this.setLinkDialog;
  this.scheduleEffect(0, () => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const editor: any = this.editorResource(() => new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [2, 3, 4]
      },
      link: {
        openOnClick: false,
        isAllowedUri: (url: any) => Boolean(safeArticleLink(url))
      }
    }), TextStyleKit.configure({
      lineHeight: false
    }), TextAlign.configure({
      types: ['heading', 'paragraph']
    }), ArticleImage.configure({
      allowBase64: true
    }), Placeholder.configure({
      placeholder: '從這裡開始寫作，或貼上文字。選取文字後，可用上方工具列調整樣式。'
    })],
    content: initialContent,
    onTransaction: () => this.update(),
    onUpdate: ({
      editor
    }) => {
      onChange(editor.getJSON());
      this.update();
    },
    editorProps: {
      attributes: {
        class: 'article-body article-editable',
        role: 'textbox',
        'aria-label': '文章內文',
        'aria-multiline': 'true',
        spellcheck: 'false'
      },
      handlePaste(view: any, event: any) {
        const files: any = [...(event.clipboardData?.files || [])];
        if (!files.length) return false;
        event.preventDefault();
        void addImages(files, view.state.selection.from);
        return true;
      },
      handleDrop(view: any, event: any) {
        const files: any = [...(event.dataTransfer?.files || [])];
        if (!files.length) return false;
        event.preventDefault();
        void addImages(files, view.posAtCoords({
          left: event.clientX,
          top: event.clientY
        })?.pos || view.state.selection.from);
        return true;
      },
      transformPastedHTML(html: any) {
        const document: any = new DOMParser().parseFromString(html, 'text/html');
        document.querySelectorAll('script,style,iframe,object,embed,form').forEach((element: any) => element.remove());
        document.querySelectorAll('img').forEach((image: any) => {
          if (!safeArticleImage(image.getAttribute('src'))) image.remove();
        });
        return document.body.innerHTML;
      }
    }
  }));
  async function addImages(files: any, position: any) {
    if (!editor || editor.isDestroyed) return;
    if (articleImageCount(editor.getJSON()) + files.length > mediaPolicy.maxImages) {
      setProblem(`每篇文章最多加入 ${mediaPolicy.maxImages} 張內文圖片。`);
      return;
    }
    setBusy(true);
    setProblem('');
    try {
      const sources: any = await Promise.all(files.map(readArticleImage));
      if (!editor.isDestroyed) editor.chain().focus().insertContentAt(Math.min(position, editor.state.doc.content.size), sources.flatMap((src: any) => [{
        type: 'image',
        attrs: {
          src,
          alt: '',
          caption: '',
          width: 100,
          align: 'center'
        }
      }, {
        type: 'paragraph'
      }])).run();
    } catch (error) {
      setProblem(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (!editor) return viewOwner.fragment("fragment0", {});
  const format: any = editor.isActive('heading', {
    level: 2
  }) ? 'h2' : editor.isActive('heading', {
    level: 3
  }) ? 'h3' : editor.isActive('heading', {
    level: 4
  }) ? 'h4' : 'p';
  const style: any = editor.getAttributes('textStyle'),
    image: any = editor.isActive('image') ? editor.getAttributes('image') : null;
  function tool(label: any, content: any, command: any, active = false, disabled = false) {
    return viewOwner.fragment("fragment1", {
      v0: `rich-tool ${active ? 'is-active' : ''}`,
      v1: label,
      v2: label,
      v3: active,
      v4: disabled,
      v5: (event: any) => event.preventDefault(),
      v6: command,
      v7: content
    });
  }
  function saveLink(event: any) {
    event.preventDefault();
    const form: any = new FormData(event.currentTarget),
      href: any = safeArticleLink(String(form.get('href') || '').trim());
    if (!href) {
      setProblem('連結請使用完整的 http:// 或 https:// 網址。');
      return;
    }
    const label: any = String(form.get('label') || '').trim();
    if (editor.state.selection.empty && label) editor.chain().focus().insertContent({
      type: 'text',
      text: label,
      marks: [{
        type: 'link',
        attrs: {
          href
        }
      }]
    }).run();else if (editor.state.selection.empty) editor.chain().focus().insertContent({
      type: 'text',
      text: href,
      marks: [{
        type: 'link',
        attrs: {
          href
        }
      }]
    }).run();else editor.chain().focus().setLink({
      href
    }).run();
    setLinkDialog(null);
    setProblem('');
  }
  return viewOwner.fragment("fragment59", {
    v0: viewOwner.fragment("fragment29", {
      v0: viewOwner.fragment("fragment14", {
        v0: viewOwner.fragment("fragment7", {
          v0: viewOwner.fragment("fragment6", {
            v0: format,
            v1: (event: any) => event.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({
              level: Number(event.target.value.slice(1))
            }).run(),
            v2: viewOwner.fragment("fragment2", {
              v0: "p"
            }),
            v3: viewOwner.fragment("fragment3", {
              v0: "h2"
            }),
            v4: viewOwner.fragment("fragment4", {
              v0: "h3"
            }),
            v5: viewOwner.fragment("fragment5", {
              v0: "h4"
            })
          })
        }),
        v1: viewOwner.fragment("fragment10", {
          v0: viewOwner.fragment("fragment9", {
            v0: articleFonts.includes(style.fontFamily) ? style.fontFamily : 'Noto Sans TC',
            v1: (event: any) => editor.chain().focus().setFontFamily(event.target.value).run(),
            v2: articleFonts.map((font: any, index: any) => viewOwner.fragment("fragment8", {
              v0: font,
              v1: ['思源黑體', '思源宋體', 'Arial', 'Georgia'][index]
            }, font))
          })
        }),
        v2: viewOwner.fragment("fragment13", {
          v0: viewOwner.fragment("fragment12", {
            v0: style.fontSize || '18px',
            v1: (event: any) => editor.chain().focus().setFontSize(event.target.value).run(),
            v2: articleFontSizes.map((size: any) => viewOwner.fragment("fragment11", {
              v0: `${size}px`,
              v1: size
            }, size))
          })
        })
      }),
      v1: viewOwner.fragment("fragment28", {
        v0: tool('粗體', viewOwner.fragment("fragment15", {}), () => editor.chain().focus().toggleBold().run(), editor.isActive('bold')),
        v1: tool('斜體', viewOwner.fragment("fragment16", {}), () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic')),
        v2: tool('底線', viewOwner.fragment("fragment17", {}), () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline')),
        v3: viewOwner.fragment("fragment20", {
          v0: viewOwner.fragment("fragment18", {}),
          v1: viewOwner.fragment("fragment19", {
            v0: safeArticleColor(style.color) || '#102722',
            v1: (event: any) => editor.chain().focus().setColor(event.currentTarget.value).run(),
            v2: (event: any) => editor.chain().focus().setColor(event.target.value).run()
          })
        }),
        v4: viewOwner.fragment("fragment23", {
          v0: viewOwner.fragment("fragment21", {}),
          v1: viewOwner.fragment("fragment22", {
            v0: safeArticleColor(style.backgroundColor) || '#fff2a8',
            v1: (event: any) => editor.chain().focus().setBackgroundColor(event.currentTarget.value).run(),
            v2: (event: any) => editor.chain().focus().setBackgroundColor(event.target.value).run()
          })
        }),
        v5: tool('螢光標示', '▰', () => editor.chain().focus().setBackgroundColor('#fff2a8').run(), Boolean(style.backgroundColor)),
        v6: tool('清除文字格式', 'Tx', () => editor.chain().focus().unsetAllMarks().run()),
        v7: viewOwner.fragment("fragment24", {}),
        v8: tool('項目清單', '• ≡', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList')),
        v9: tool('編號清單', '1. ≡', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList')),
        v10: tool('引言', '❝', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote')),
        v11: tool('分割線', '―', () => editor.chain().focus().setHorizontalRule().run()),
        v12: tool('靠左對齊', '⇤', () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({
          textAlign: 'left'
        })),
        v13: tool('置中對齊', '↔', () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({
          textAlign: 'center'
        })),
        v14: tool('靠右對齊', '⇥', () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({
          textAlign: 'right'
        })),
        v15: tool('加入連結', '連結', () => {
          setProblem('');
          setLinkDialog({
            href: editor.getAttributes('link').href || ''
          });
        }, editor.isActive('link')),
        v16: tool('移除連結', '斷鏈', () => editor.chain().focus().unsetLink().run(), false, !editor.isActive('link')),
        v17: viewOwner.fragment("fragment25", {}),
        v18: tool('復原', '↶', () => editor.chain().focus().undo().run(), false, !editor.can().undo()),
        v19: tool('重做', '↷', () => editor.chain().focus().redo().run(), false, !editor.can().redo()),
        v20: viewOwner.fragment("fragment26", {
          v0: busy,
          v1: () => {
            uploadPosition.current = editor.state.selection.from;
            upload.current.click();
          },
          v2: busy ? '讀取圖片中…' : '＋ 加入圖片'
        }),
        v21: viewOwner.fragment("fragment27", {
          v0: upload,
          v1: true,
          v2: true,
          v3: (event: any) => {
            const files: any = [...event.target.files];
            event.target.value = '';
            if (files.length) void addImages(files, uploadPosition.current);
          }
        })
      })
    }),
    v1: image && viewOwner.fragment("fragment47", {
      v0: viewOwner.fragment("fragment32", {
        v0: viewOwner.fragment("fragment30", {}),
        v1: viewOwner.fragment("fragment31", {
          v0: () => editor.chain().focus().deleteNode('image').run()
        })
      }),
      v1: viewOwner.fragment("fragment37", {
        v0: viewOwner.fragment("fragment34", {
          v0: viewOwner.fragment("fragment33", {
            v0: image.caption || '',
            v1: 500,
            v2: (event: any) => editor.commands.updateAttributes('image', {
              caption: event.currentTarget.value
            }),
            v3: (event: any) => editor.commands.updateAttributes('image', {
              caption: event.target.value
            })
          })
        }),
        v1: viewOwner.fragment("fragment36", {
          v0: viewOwner.fragment("fragment35", {
            v0: image.alt || '',
            v1: 250,
            v2: (event: any) => editor.commands.updateAttributes('image', {
              alt: event.currentTarget.value
            }),
            v3: (event: any) => editor.commands.updateAttributes('image', {
              alt: event.target.value
            })
          })
        })
      }),
      v2: viewOwner.fragment("fragment45", {
        v0: viewOwner.fragment("fragment39", {
          v0: image.width || 100,
          v1: viewOwner.fragment("fragment38", {
            v0: image.width || 100,
            v1: (event: any) => editor.commands.updateAttributes('image', {
              width: Number(event.currentTarget.value)
            }),
            v2: (event: any) => editor.commands.updateAttributes('image', {
              width: Number(event.target.value)
            })
          })
        }),
        v1: viewOwner.fragment("fragment44", {
          v0: viewOwner.fragment("fragment43", {
            v0: image.align || 'center',
            v1: (event: any) => editor.commands.updateAttributes('image', {
              align: event.target.value
            }),
            v2: viewOwner.fragment("fragment40", {
              v0: "left"
            }),
            v3: viewOwner.fragment("fragment41", {
              v0: "center"
            }),
            v4: viewOwner.fragment("fragment42", {
              v0: "right"
            })
          })
        })
      }),
      v3: viewOwner.fragment("fragment46", {})
    }),
    v2: problem && viewOwner.fragment("fragment48", {
      v0: problem
    }),
    v3: viewOwner.fragment("fragment49", {
      v0: editor
    }),
    v4: viewOwner.fragment("fragment50", {}),
    v5: linkDialog && viewOwner.fragment("fragment58", {
      v0: Dialog,
      v1: {
        "title": "加入文章連結",
        "onClose": () => {
          setLinkDialog(null);
          setProblem('');
        },
        children: [viewOwner.fragment("fragment57", {
          v0: saveLink,
          v1: viewOwner.fragment("fragment52", {
            v0: viewOwner.fragment("fragment51", {
              v0: linkDialog.href,
              v1: true
            })
          }),
          v2: editor.state.selection.empty && viewOwner.fragment("fragment54", {
            v0: viewOwner.fragment("fragment53", {})
          }),
          v3: problem && viewOwner.fragment("fragment55", {
            v0: problem
          }),
          v4: viewOwner.fragment("fragment56", {})
        })]
      }
    })
  });
}
}
