import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, GoogleLogo, LockSimple } from '@phosphor-icons/react';

const empty = { name:'',email:'',phone:'',residency:'',nickname:'',password:'',emergencyName:'',emergencyPhone:'',division:'',social:'' };
export function SignupPage({ groups, onBack, onLogin }) {
  const [method,setMethod] = useState('EMAIL');
  const [step,setStep] = useState(1);
  const [data,setData] = useState(empty);
  const [errors,setErrors] = useState({});
  const [consent,setConsent] = useState(false);
  const [complete,setComplete] = useState(false);
  const update = key => event => { setData(previous=>({...previous,[key]:event.target.value}));setErrors(previous=>({...previous,[key]:''})); };
  function useGoogle() {
    setMethod('GOOGLE');
    setData(previous=>({...previous,name:previous.name||'示範會員',email:previous.email||'runner@example.test',password:''}));
    setErrors({});
  }
  function submit(event) {
    event.preventDefault();
    const next = {};
    if (step===1) {
      if(!data.name.trim())next.name='請填寫姓名。';
      if(!/^\S+@\S+\.\S+$/.test(data.email.trim()))next.email='請填寫有效的 Email。';
      if(!data.phone.trim())next.phone='請填寫手機號碼。';
      if(!data.residency)next.residency='請選擇本國人或外國人。';
      if(method==='EMAIL'&&data.password.length<8)next.password='示範密碼請輸入至少 8 個字元。';
    } else {
      if(!data.emergencyName.trim())next.emergencyName='請填寫緊急聯絡人。';
      if(!data.emergencyPhone.trim())next.emergencyPhone='請填寫緊急聯絡人電話。';
      if(!data.division)next.division='請選擇預設報名組別。';
      if(!consent)next.consent='請先閱讀並勾選示範註冊告知。';
    }
    setErrors(next);
    if(Object.keys(next).length)return;
    if(step===1){setStep(2);window.scrollTo(0,0);return;}
    setData(previous=>({...previous,password:''}));
    setComplete(true);window.scrollTo(0,0);
  }
  // Stable field component identity keeps focus and mobile keyboards while typing.
  const field = (key,label,type='text',optional=false,placeholder='') => <div className="field" key={key}><label htmlFor={`signup-${key}`}>{label}{optional&&<span className="optional">選填</span>}</label><input id={`signup-${key}`} name={key} type={type} required={!optional} autoComplete="off" placeholder={placeholder} value={data[key]} onChange={update(key)} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key]?`error-${key}`:undefined}/>{errors[key]&&<span className="field-error" id={`error-${key}`}>{errors[key]}</span>}</div>;
  return <main id="main" className="signup-page">
    <aside className="signup-story"><button className="story-back" onClick={onBack}><ArrowLeft size={20}/>返回賽事列表</button><div><p className="signup-kicker">一起，走進森林</p><h1>下一段旅程，<br/>從這裡開始。</h1><p>建立你的會員資料，<br/>讓每一次出發都更從容。</p></div><img src={`${import.meta.env.BASE_URL}assets/forest-tablet.png`} alt="陽光照耀森林中的定向越野檢查點"/><p className="signup-story-note">已經有帳號？<button onClick={onLogin}>前往登入<ArrowRight size={17}/></button></p></aside>
    <section className="signup-content" aria-label="會員註冊">
      {complete?<div className="signup-complete"><CheckCircle size={58} weight="light"/><p className="eyebrow">會員註冊 · 示範</p><h2>驗證 Email，<br/>開始下一段旅程。</h2><p>註冊資料已送出（示範）。正式網站將寄送驗證信至：</p><strong className="signup-email">{data.email}</strong><p className="hint">此原型不建立真實帳號或寄送郵件。完成身分驗證後，才可進行正式報名。</p><button className="primary" onClick={onBack}>返回賽事列表<ArrowRight size={20}/></button><button className="text-button" onClick={onLogin}>前往登入畫面</button></div>:<>
      <p className="eyebrow">會員註冊</p><header className="signup-heading"><h2>準備好，一起出發。</h2><p>請完成必要資料，之後報名將自動帶入。</p></header>
      <ol className="steps signup-steps" aria-label="註冊步驟"><li aria-current={step===1?'step':undefined}><span>1</span>帳號與基本資料</li><li aria-current={step===2?'step':undefined}><span>2</span>聯絡資料與告知</li></ol>
      <p className="preview-warning">介面示範，請使用虛構資料與示範密碼。</p>
      <form onSubmit={submit} noValidate>
        {step===1?<>
          <button className="google-signup" type="button" onClick={useGoogle}><GoogleLogo size={22}/>使用 Google 註冊<span>示範</span></button>
          {method==='GOOGLE'?<div className="signup-method-note"><CheckCircle size={19}/><span>已帶入 Google 示範姓名及 Email，請補齊其餘必填資料。</span><button type="button" onClick={()=>{setMethod('EMAIL');setErrors({});}}>改用 Email</button></div>:<p className="signup-divider">或使用 Email 註冊</p>}
          <div className="signup-field-grid">{field('name','姓名')}{field('nickname','綽號','text',true)}</div>
          {field('email','Email','email',false,'you@example.com')}
          {method==='EMAIL'&&field('password','設定密碼','password',false,'請使用示範密碼，至少 8 個字元')}
          {field('phone','手機','tel',false,'例：0900 000 000')}
          <fieldset className="signup-residency" aria-invalid={Boolean(errors.residency)} aria-describedby={errors.residency?'signup-residency-error':undefined}><legend>會員分類</legend><div className="signup-radio-grid">{[['DOMESTIC','本國人'],['FOREIGN','外國人']].map(([value,label])=><label className={data.residency===value?'radio-row selected':'radio-row'} key={value}><input type="radio" required name="signup-residency" checked={data.residency===value} onChange={()=>{setData(previous=>({...previous,residency:value}));setErrors(previous=>({...previous,residency:''}));}}/><span>{label}</span></label>)}</div>{errors.residency&&<span className="field-error" id="signup-residency-error">{errors.residency}</span>}<p className="hint">外國人單次報名可另選現場繳費。</p></fieldset>
        </>:<>
          <div className="signup-step-summary"><CheckCircle size={22}/><div><strong>{data.name}</strong><p>{data.email} · {data.residency==='FOREIGN'?'外國人':'本國人'}</p></div></div>
          {field('emergencyName','緊急聯絡人')}{field('emergencyPhone','緊急聯絡人電話','tel')}
          <div className="field"><label htmlFor="signup-division">預設報名組別</label><select id="signup-division" required aria-describedby={errors.division?'signup-division-hint signup-division-error':'signup-division-hint'} value={data.division} onChange={update('division')} aria-invalid={Boolean(errors.division)}><option value="">請選擇組別</option>{groups.map(group=><option key={group}>{group}</option>)}</select>{errors.division&&<span className="field-error" id="signup-division-error">{errors.division}</span>}<span className="hint" id="signup-division-hint">之後報名將優先帶入，仍可選擇賽事提供的其他組別。</span></div>
          {field('social','社群帳號','text',true,'LINE／IG／FB 等可聯絡帳號')}
          <details className="terms"><summary>閱讀示範註冊告知</summary><p>正式網站將保存會員及報名資料，供賽事報名、聯絡與管理使用；詳細告知由主辦單位提供。這是獨立的註冊告知，不取代每場活動條款。本原型資料只保留於目前畫面。</p></details>
          <label className="consent"><input type="checkbox" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent?'signup-consent-error':undefined} checked={consent} onChange={event=>{setConsent(event.target.checked);setErrors(previous=>({...previous,consent:''}));}}/><span>我已閱讀此示範註冊告知</span></label>{errors.consent&&<span className="field-error" id="signup-consent-error">{errors.consent}</span>}
        </>}
        {Object.values(errors).some(Boolean)&&<p className="form-error" role="alert">請確認標示的欄位後再繼續。</p>}
        <div className="signup-form-actions">{step===2&&<button className="text-button" type="button" onClick={()=>{setStep(1);setErrors({});window.scrollTo(0,0);}}><ArrowLeft size={18}/>返回上一步</button>}<button className="primary" type="submit">{step===1?'下一步：聯絡資料':'建立會員帳號（示範）'}<ArrowRight size={20}/></button></div>
        <p className="signup-security"><LockSimple size={16}/>姓名與 Email 完成註冊後無法自行修改。</p>
      </form></>}
    </section>
  </main>;
}
