import React, { useRef, useState } from "react";
import "./App.css";
import { FileDrop } from "react-file-drop";
import "./Demo.css";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import axios from "./axios";
import Cookie from "js-cookie";
import { ChatState } from "./context/CharProvider";
import { Buffer } from "buffer";

function Login({}) {
  const [picture, setPicture] = useState();
  const [picURL, setPicURL] = useState(false);
  const [error, setError] = useState(false);
  const [tel, setTel] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(Cookie.get("code")) || false;
  const { setUser, token, setToken, setImage } = ChatState();

  const drag = useRef(null);
  const styles = {
    border: "1px solid black",
    width: "15%",
    color: "black",
    padding: 20,
  };
  const drop = (files, event) => {
    event.preventDefault();
    setPicURL(false);
    setPicture(files[0]);
    setPicURL(URL.createObjectURL(files[0]));
  };
  const dragClick = (e) => {
    setPicURL(false);
    setPicture(e.target.files[0]);
    setPicURL(URL.createObjectURL(e.target.files[0]));
  };
  const emite = (e) => {
    drag.current.click();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z|| ]+$/.test(name)) setError("Name Format Incorrect !");
    else if (!tel.match(/^\+(?:[0-9] ?){6,14}[0-9]$/))
      setError("Telephone format is incorrect !");
    else {
      if (
        (picture && picture.type === "image/jpeg") ||
        (picture && picture.type === "image/png") ||
        (picture && picture.type === "image/jpg")
      ) {
        const pic = new FormData();
        pic.append("file", picture);
        pic.append("upload_preset", "whats-mern");
        pic.append("cloud_name", "daotio9px");
        fetch("https://api.cloudinary.com/v1_1/daotio9px/image/upload", {
          method: "post",
          body: pic,
        })
          .then((res) => res.json())
          .then((data) => {
            axios
              .post("/login", {
                name: name,
                phone: tel,
                picture: data.url.toString(),
              })
              .then(({ data }) => {
                setCode(data.code);
                setToken(data.token);
                Cookie.set("code", data.code, { expires: 1 });
                Cookie.set("token", data.token, { expires: 1 });
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (!picture) {
        axios
          .post("/login", {
            name: name,
            phone: tel,
          })
          .then(({ data }) => {
            setCode(data.code);
            setToken(data.token);
            Cookie.set("code", data.code, { expires: 1 });
            Cookie.set("token", data.token, { expires: 1 });
          });
      }
    }
  };
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (e.target.code.value.length < 6)
      return setError("code Must contains 6 numbers");
    axios
      .post(
        "/login-code",
        { code: e.target.code.value },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      )
      .then(({ data }) => {
        setError(false);
        setCode(false);
        Cookie.remove("code");
        Cookie.set("token", data.token, { expires: 1 });
        setToken(data.token);
        const image = data.picture;
        sessionStorage.setItem("image", image);
        setImage(image);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      });
  };
  return (
    <div className="login app__body">
      <div className="login__header">
        <h1>WhatsApp Web</h1>
      </div>
      <div className="login__main">
        {code ? (
          <form onSubmit={handleCodeSubmit}>
            <label>Enter ths SMS code you have receiverd</label>
            <input
              type="number"
              name="code"
              placeholder="CODE..."
              onFocus={(e) => setError(false)}
            />
            <input type="submit" value="Send" />
            {error && <p className="login__error">{error}</p>}
            <p className="login__error">
              Votre Code est : {code} <br />
              This is a tryal version{" "}
            </p>
          </form>
        ) : (
          <form className="login__form" onSubmit={handleSubmit}>
            <div
              className="drag"
              style={styles}
              onClick={emite}
              onMouseUpCapture={(e) => setPicURL(false)}
            >
              {picURL ? (
                <>
                  <img
                    style={{ maxWidth: "100%", height: "100%" }}
                    src={picURL}
                  />
                  <img
                    className="delete__icon"
                    src="delete.png"
                    onClick={(e) => {
                      setPicture({});
                      setPicURL(false);
                    }}
                  />
                </>
              ) : (
                <FileDrop
                  onDrop={(files, event) => {
                    event.preventDefault();
                    drop(files, event);
                  }}
                >
                  Click or Drop Profile Picture
                </FileDrop>
              )}
            </div>
            <div className="login__form__right">
              <input
                type="file"
                name="picture"
                hidden
                onChange={dragClick}
                ref={drag}
              />
              <h2>Enter your Phone Number you will reveice SMS</h2>
              <label id="clear-drag">Name: </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => setError(false)}
                placeholder="Enter Your Name"
              />
              <label>Telephone: </label>

              <PhoneInput
                placeholder="Enter phone number"
                value={tel}
                onChange={setTel}
                onFocus={(e) => setError(false)}
              />
              <input
                type="submit"
                value="Validez ...!"
                className="login__button"
              />
              {error && <p className="login__error">{error}</p>}
            </div>
          </form>
        )}
        <div className="login__footer">
          <div className="login__footer__list">
            <img className="login__icons" src="android.png" />
            <h3 className="login__footer__titles">Android</h3>
            <p>Open WhatsApp - Meeting - WhatsApp Web</p>
          </div>
          <div className="login__footer__list">
            <img className="login__icons" src="iphone.png" />
            <h3 className="login__footer__titles">IPhone</h3>
            <p>Open WhatsApp - Meeting - WhatsApp Web</p>
          </div>
          <div className="login__footer__list">
            <img className="login__icons" src="windows.png" />
            <h3 className="login__footer__titles">Windows Phone</h3>
            <p>Open WhatsApp - Meeting - WhatsApp Web</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
