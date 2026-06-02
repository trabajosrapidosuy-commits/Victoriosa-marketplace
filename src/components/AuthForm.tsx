"use client";

import { useState } from "react";

export default function AuthForm({ action, mode }: { action: (formData: FormData) => void; mode: "login" | "register" | "forgot" | "reset" }) {
  const [show, setShow] = useState(false);
  const needsPassword = mode !== "forgot";
  return (
    <form action={action} className="auth-form">
      {mode === "register" ? <label>Nombre completo<input name="full_name" required /></label> : null}
      {mode !== "reset" ? <label>Email<input autoComplete="email" name="email" required type="email" /></label> : null}
      {needsPassword ? <label>Clave<div className="password-field"><input minLength={8} name="password" required type={show ? "text" : "password"} /><button onClick={() => setShow(!show)} type="button">{show ? "Ocultar" : "Mostrar"}</button></div></label> : null}
      <button className="editorial-button" type="submit">{mode === "login" ? "Ingresar" : mode === "register" ? "Crear cuenta" : mode === "forgot" ? "Enviar instrucciones" : "Actualizar clave"}</button>
    </form>
  );
}
