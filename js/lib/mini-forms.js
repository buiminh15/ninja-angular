/* mini-forms: Reactive Forms thu nhỏ (FormControl, FormGroup, Validators, valueChanges, validator đồng bộ + bất đồng bộ,
   trạng thái pristine/dirty/touched/pending, updateOn) cùng hàm bind() gắn control vào <input>.
   Tên API giống @angular/forms. */
globalThis.MiniForms = (function () {
  const R = globalThis.Rx;
  const isEmpty = v => v == null || v === '' || (Array.isArray(v) && !v.length);
  const Validators = {
    required: c => (isEmpty(c.value) ? { required: true } : null),
    minLength: n => c => (isEmpty(c.value) || String(c.value).length >= n ? null : { minlength: { requiredLength: n, actualLength: String(c.value).length } }),
    maxLength: n => c => (isEmpty(c.value) || String(c.value).length <= n ? null : { maxlength: { requiredLength: n, actualLength: String(c.value).length } }),
    email: c => (isEmpty(c.value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value) ? null : { email: true }),
    min: n => c => (isEmpty(c.value) || +c.value >= n ? null : { min: { min: n, actual: +c.value } }),
    max: n => c => (isEmpty(c.value) || +c.value <= n ? null : { max: { max: n, actual: +c.value } }),
    pattern: p => c => { const re = p instanceof RegExp ? p : new RegExp('^' + p + '$'); return isEmpty(c.value) || re.test(c.value) ? null : { pattern: { requiredPattern: String(re), actualValue: c.value } }; },
    compose: list => c => { const errs = list.map(v => v(c)).filter(Boolean); return errs.length ? Object.assign({}, ...errs) : null; }
  };

  class AbstractControl {
    constructor(validators, asyncValidators, updateOn) {
      this.validator = Array.isArray(validators) ? Validators.compose(validators) : validators || null;
      this.asyncValidator = asyncValidators || null;
      this.updateOn = updateOn || null;
      this.errors = null; this.status = 'VALID'; this.parent = null;
      this._pristine = true; this._touched = false; this._listeners = [];
      this.valueChanges = new R.Subject(); this.statusChanges = new R.Subject();
    }
    get root() { let c = this; while (c.parent) c = c.parent; return c; }
    get effectiveUpdateOn() { return this.updateOn || (this.parent && this.parent.effectiveUpdateOn) || 'change'; }
    get valid() { return this.status === 'VALID'; } get invalid() { return this.status === 'INVALID'; } get pending() { return this.status === 'PENDING'; }
    get pristine() { return this._pristine; } get dirty() { return !this._pristine; } get touched() { return this._touched; } get untouched() { return !this._touched; }
    onStateChange(fn) { this._listeners.push(fn); }
    _notify() { this._listeners.forEach(f => f(this)); if (this.parent) this.parent._notify(); }
    hasError(code, path) { const c = path ? this.get(path) : this; return !!(c && c.errors && code in c.errors); }
    getError(code, path) { const c = path ? this.get(path) : this; return c && c.errors ? c.errors[code] : null; }
    get(path) { const parts = Array.isArray(path) ? path : String(path).split('.'); let c = this; for (const p of parts) { if (!c || !c.controls) return null; c = c.controls[p]; } return c || null; }
    markAsTouched() { this._touched = true; this._notify(); }
    markAsDirty() { this._pristine = false; this._notify(); }
    markAsPristine() { this._pristine = true; this._notify(); }
    markAsUntouched() { this._touched = false; this._notify(); }
    /* chạy validator, cập nhật status + errors */
    updateValueAndValidity({ emitEvent = true } = {}) {
      this._updateValue();
      this.errors = this.validator ? this.validator(this) : null;
      this._asyncSub && this._asyncSub.unsubscribe();
      this.status = this._computeStatus();
      if (this.status === 'VALID' && this.asyncValidator) {
        this.status = 'PENDING';
        const obs = this.asyncValidator(this);
        this._asyncSub = obs.subscribe(errs => { this.errors = errs; this.status = this._computeStatus(); this._finish(emitEvent, true); if (this.parent) this.parent.updateValueAndValidity({ emitEvent: false }); });
      }
      this._finish(emitEvent, false);
      if (this.parent) this.parent.updateValueAndValidity({ emitEvent });
    }
    _finish(emitEvent, fromAsync) { if (emitEvent && !fromAsync) this.valueChanges.next(this.value); if (emitEvent) this.statusChanges.next(this.status); this._notify(); }
    _computeStatus() {
      if (this.errors) return 'INVALID';
      if (this._anyChild('PENDING')) return 'PENDING';
      if (this._anyChild('INVALID')) return 'INVALID';
      return 'VALID';
    }
    _anyChild() { return false; }
    _updateValue() {}
  }

  class FormControl extends AbstractControl {
    constructor(value = '', validatorOrOpts, asyncValidator) {
      const o = validatorOrOpts && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object' ? validatorOrOpts : { validators: validatorOrOpts };
      super(o.validators, o.asyncValidators || asyncValidator, o.updateOn);
      this.value = value; this.defaultValue = value; this._viewCbs = [];
      this.updateValueAndValidity({ emitEvent: false });
    }
    registerOnChange(fn) { this._viewCbs.push(fn); }
    setValue(v, { emitEvent = true, emitModelToViewChange = true } = {}) {
      this.value = v;
      if (emitModelToViewChange) this._viewCbs.forEach(f => f(v));
      this.updateValueAndValidity({ emitEvent });
    }
    patchValue(v, o) { this.setValue(v, o); }
    reset(v = this.defaultValue) { this._pristine = true; this._touched = false; this.setValue(v); }
  }

  class FormGroup extends AbstractControl {
    constructor(controls, validatorOrOpts, asyncValidator) {
      const o = validatorOrOpts && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object' ? validatorOrOpts : { validators: validatorOrOpts };
      super(o.validators, o.asyncValidators || asyncValidator, o.updateOn);
      this.controls = controls; Object.values(controls).forEach(c => (c.parent = this));
      this.value = {}; this.updateValueAndValidity({ emitEvent: false });
    }
    _updateValue() { this.value = Object.fromEntries(Object.entries(this.controls).map(([k, c]) => [k, c.value])); }
    _anyChild(s) { return Object.values(this.controls).some(c => c.status === s); }
    get pristine() { return Object.values(this.controls).every(c => c.pristine); }
    get dirty() { return !this.pristine; }
    get touched() { return Object.values(this.controls).some(c => c.touched); }
    get untouched() { return !this.touched; }
    setValue(v) { Object.entries(v).forEach(([k, x]) => this.controls[k].setValue(x)); }
    reset() { Object.values(this.controls).forEach(c => c.reset && c.reset()); }
    get submittedFlag() { return !!this._submitted; }
    markAllAsTouched() { Object.values(this.controls).forEach(c => (c.markAllAsTouched ? c.markAllAsTouched() : c.markAsTouched())); }
  }

  /* FormBuilder tối giản */
  const fb = {
    control: (v, val, async) => new FormControl(v, val, async),
    group: (cfg, opts) => new FormGroup(Object.fromEntries(Object.entries(cfg).map(([k, x]) => [k, x instanceof AbstractControl ? x : Array.isArray(x) ? new FormControl(x[0], x[1], x[2]) : new FormControl(x)])), opts)
  };

  /* gắn FormControl vào <input> (formControlName / ngModel tương đương) */
  function bind(el, control, { form } = {}) {
    let pendingValue = null, hasPending = false;
    const apply = () => { if (hasPending) { control.setValue(pendingValue, { emitModelToViewChange: false }); hasPending = false; } };
    const classes = () => {
      const c = control, g = n => el.classList;
      el.classList.toggle('ng-pristine', c.pristine); el.classList.toggle('ng-dirty', c.dirty);
      el.classList.toggle('ng-untouched', c.untouched); el.classList.toggle('ng-touched', c.touched);
      el.classList.toggle('ng-valid', c.valid); el.classList.toggle('ng-invalid', c.invalid); el.classList.toggle('ng-pending', c.pending);
    };
    control.registerOnChange(v => { if (el.value !== String(v == null ? '' : v)) el.value = v == null ? '' : v; });
    control.onStateChange(classes);
    el.value = control.value == null ? '' : control.value;
    el.addEventListener('input', () => {
      control.markAsDirty();
      const u = control.effectiveUpdateOn;
      if (u === 'change') control.setValue(el.value, { emitModelToViewChange: false });
      else { pendingValue = el.value; hasPending = true; }
    });
    el.addEventListener('blur', () => { if (control.effectiveUpdateOn === 'blur') apply(); control.markAsTouched(); });
    if (form) form.addEventListener('submit', () => { if (control.effectiveUpdateOn === 'submit') apply(); });
    classes();
    return { flush: apply };
  }

  return { Validators, AbstractControl, FormControl, FormGroup, fb, bind };
})();
