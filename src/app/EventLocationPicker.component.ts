import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewController, ViewAnchor, ElementBinding, ElementAttributes, EditorMount, FormValue } from './view-controller';
import { ViewFragmentComponent, ViewComponent } from './view-fragment.component';
import L from 'leaflet';
const taiwan: any = [23.8, 121];
const validPoint: any = (lat: any, lng: any) => lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Math.abs(Number(lat)) <= 85 && Math.abs(Number(lng)) <= 180;
const pin: any = L.divIcon({
  className: 'location-pin',
  html: '<span></span>',
  iconSize: [30, 36],
  iconAnchor: [15, 36]
});
@Component({selector:'demo-event-location-picker',standalone:true,imports:[ViewFragmentComponent, ViewAnchor, FormValue, ElementBinding],host:{style:'display: contents'},templateUrl:'./EventLocationPicker.EventLocationPicker.html'})
export class EventLocationPicker extends ViewController {
private _state_latitude:any; private _ready_latitude=false;
private setLatitude=(next:any)=>{const value=typeof next==='function'?next(this._state_latitude):next;if(!Object.is(value,this._state_latitude)){this._state_latitude=value;this.update();}};
private _state_longitude:any; private _ready_longitude=false;
private setLongitude=(next:any)=>{const value=typeof next==='function'?next(this._state_longitude):next;if(!Object.is(value,this._state_longitude)){this._state_longitude=value;this.update();}};
private _state_approximate:any; private _ready_approximate=false;
private setApproximate=(next:any)=>{const value=typeof next==='function'?next(this._state_approximate):next;if(!Object.is(value,this._state_approximate)){this._state_approximate=value;this.update();}};
private _state_tileError:any; private _ready_tileError=false;
private setTileError=(next:any)=>{const value=typeof next==='function'?next(this._state_tileError):next;if(!Object.is(value,this._state_tileError)){this._state_tileError=value;this.update();}};
private _resource_container:any;
private _resource_map:any;
private _resource_marker:any;
private _resource_tiles:any;
private _resource_descriptionId:any;
protected compute(propsValue:any):any {
  const viewOwner: any = this;
  const {
    initialValue
  } = propsValue;
  if (!this._ready_latitude) {
    const stateInitial: any = initialValue?.lat ?? '';
    this._state_latitude = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_latitude = true;
  }
  const latitude: any = this._state_latitude;
  const setLatitude: any = this.setLatitude;
  if (!this._ready_longitude) {
    const stateInitial: any = initialValue?.lng ?? '';
    this._state_longitude = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_longitude = true;
  }
  const longitude: any = this._state_longitude;
  const setLongitude: any = this.setLongitude;
  if (!this._ready_approximate) {
    const stateInitial: any = initialValue?.approximate ?? false;
    this._state_approximate = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_approximate = true;
  }
  const approximate: any = this._state_approximate;
  const setApproximate: any = this.setApproximate;
  if (!this._ready_tileError) {
    const stateInitial: any = false;
    this._state_tileError = typeof stateInitial === 'function' ? stateInitial() : stateInitial;
    this._ready_tileError = true;
  }
  const tileError: any = this._state_tileError;
  const setTileError: any = this.setTileError;
  const container: any = this._resource_container ??= {
      current: null
    },
    map: any = this._resource_map ??= {
      current: null
    },
    marker: any = this._resource_marker ??= {
      current: null
    },
    tiles: any = this._resource_tiles ??= {
      current: null
    };
  const descriptionId: any = this._resource_descriptionId ??= 'field-' + crypto.randomUUID();
  const selected: any = validPoint(latitude, longitude);
  function choose(latlng: any) {
    setLatitude(Number(Math.max(-85, Math.min(85, latlng.lat)).toFixed(6)));
    setLongitude(Number(latlng.wrap().lng.toFixed(6)));
    setApproximate(false);
  }
  this.scheduleEffect(0, () => {
    const hasInitialPoint: any = validPoint(initialValue?.lat ?? '', initialValue?.lng ?? '');
    const instance: any = L.map(container.current, {
      scrollWheelZoom: false,
      attributionControl: true
    }).setView(hasInitialPoint ? [Number(initialValue.lat), Number(initialValue.lng)] : taiwan, hasInitialPoint ? initialValue.approximate ? 12 : 15 : 7);
    map.current = instance;
    tiles.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    }).addTo(instance);
    tiles.current.on('tileerror', () => setTileError(true));
    instance.on('click', (event: any) => choose(event.latlng));
    instance.zoomControl.getContainer().querySelector('.leaflet-control-zoom-in').setAttribute('aria-label', '放大地圖');
    instance.zoomControl.getContainer().querySelector('.leaflet-control-zoom-out').setAttribute('aria-label', '縮小地圖');
    const observer: any = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    instance.invalidateSize();
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
      marker.current = null;
      tiles.current = null;
    };
  }, []);
  this.scheduleEffect(1, () => {
    if (!map.current) return;
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    if (selected && !approximate) {
      marker.current = L.marker([Number(latitude), Number(longitude)], {
        icon: pin,
        draggable: true,
        title: '賽事位置，可拖曳調整',
        alt: '賽事位置'
      }).addTo(map.current);
      marker.current.on('dragend', (event: any) => choose(event.target.getLatLng()));
    }
  }, [latitude, longitude, approximate, selected]);
  function locate() {
    if (selected) map.current?.setView([Number(latitude), Number(longitude)], approximate ? 12 : 16);
  }
  return viewOwner.fragment("fragment18", {
    v0: viewOwner.fragment("fragment0", {}),
    v1: viewOwner.fragment("fragment1", {
      v0: descriptionId
    }),
    v2: viewOwner.fragment("fragment2", {
      v0: container,
      v1: descriptionId
    }),
    v3: tileError && viewOwner.fragment("fragment4", {
      v0: viewOwner.fragment("fragment3", {
        v0: () => {
          setTileError(false);
          tiles.current?.redraw();
        }
      })
    }),
    v4: viewOwner.fragment("fragment5", {
      v0: selected ? approximate ? '目前為區域示意；點選地圖即可改為精確位置。' : `已標記賽事位置：${latitude}, ${longitude}` : latitude !== '' || longitude !== '' ? '請填入有效且成對的經緯度，或重新點選地圖。' : '尚未設定位置，請點選地圖。'
    }),
    v5: viewOwner.fragment("fragment9", {
      v0: viewOwner.fragment("fragment6", {
        v0: () => choose(map.current.getCenter())
      }),
      v1: viewOwner.fragment("fragment7", {
        v0: !selected,
        v1: locate
      }),
      v2: viewOwner.fragment("fragment8", {
        v0: latitude === '' && longitude === '',
        v1: () => {
          setLatitude('');
          setLongitude('');
          setApproximate(false);
        }
      })
    }),
    v6: viewOwner.fragment("fragment14", {
      v0: viewOwner.fragment("fragment11", {
        v0: viewOwner.fragment("fragment10", {
          v0: latitude,
          v1: (event: any) => setLatitude(event.currentTarget.value),
          v2: (event: any) => setLatitude(event.target.value)
        })
      }),
      v1: viewOwner.fragment("fragment13", {
        v0: viewOwner.fragment("fragment12", {
          v0: longitude,
          v1: (event: any) => setLongitude(event.currentTarget.value),
          v2: (event: any) => setLongitude(event.target.value)
        })
      })
    }),
    v7: viewOwner.fragment("fragment16", {
      v0: viewOwner.fragment("fragment15", {
        v0: approximate,
        v1: (event: any) => setApproximate(event.target.checked)
      })
    }),
    v8: viewOwner.fragment("fragment17", {})
  });
}
}
