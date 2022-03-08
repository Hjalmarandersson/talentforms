const firebaseConfig = FBCONFIG;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Make firestore & auth references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// On-load functionns
$(window).on("load", function () {
  $(".onload-spinner").hide();
});

// Company Sign Up
const companySignupForm = document.querySelector("#company-signup-form");
companySignupForm.addEventListener("submit", (signup) => {
  signup.preventDefault();

  // Slugify for URL's
  const slugify = (string) => {
    const a = "àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;";
    const b = "aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------";
    const p = new RegExp(a.split("").join("|"), "g");
    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters in a with b
      .replace(/&/g, "-and-") // Replace & with ‘and’
      .replace(/[^\w-]+/g, "") // Remove all non-word characters such as spaces or tabs
      .replace(/--+/g, "-") // Replace multiple — with single -
      .replace(/^-+/, "") // Trim — from start of text
      .replace(/-+$/, ""); // Trim — from end of text
  };
  const email = companySignupForm["companySignupEmail"].value;
  const password = companySignupForm["companySignupPassword"].value;

  // Sign the user up
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db
        .collection("companies")
        .doc(cred.user.uid)
        .set({
          companyname: companySignupForm["companyName"].value,
          urlslug: slugify(companySignupForm["companyUrlSlug"].value), // slugify vanity URL
          companyemail: companySignupForm["companySignupEmail"].value,
          created: firebase.firestore.FieldValue.serverTimestamp(), // Timestamp if wanted sometime
        })
        .then(() => {
          var uid = firebase.auth().currentUser.uid;
          return db
            .collection("talentforms")
            .doc(uid)
            .set({
              headline: "Enter a position you wish to recruit for",
              logo: "https://via.placeholder.com/150",
              urlslug: slugify(companySignupForm["companyUrlSlug"].value),
              companyname: companySignupForm["companyName"].value,
              description: "Describe the position you wish to recruit for",
              question_1:
                "What made you want to apply for this position? And why do you want to work here?",
              question_2:
                "Tell us about your domain expertise and how have you leveraged it in your work?",
              question_3:
                "What career accomplishment makes you most proud? And why?",
              question_4:
                "What are your long-term career goals? And how do you want to improve yourself in the next year?",
              question_5:
                "Tell us about some things you like to do outside of work?",
              created: datestring,
            });
        });
    })
    .catch(function (error) {
      alert(error);
    })
    .then(() => {
      companySignupForm.reset();
      location.reload();
    });
});

// Sign up Show password requirements when click on password
function passwordCheck(nameSelect) {
  if (nameSelect) {
    admOptionValue = document.getElementById("companySignupPassword").value;
    if (admOptionValue == nameSelect.value) {
      document.getElementById("pwreq").style.display = "block";
    } else {
      document.getElementById("pwreq").style.display = "none";
    }
  } else {
    document.getElementById("pwreq").style.display = "none";
  }
}

// Password requirements
const checkMark = "\u2713";

const lowerCaseRegex = new RegExp("^(?=.*[a-z])(?=.{1,})");
const upperCaseRegex = new RegExp("^(?=.*[A-Z])(?=.{1,})");
const containsNumberRegex = new RegExp("^(?=.*[0-9])(?=.{1,})");
const specialCharacterRegex = new RegExp("^(?=.*[-_!@#$%^&*])(?=.{1,})");
const eightCharactersRegex = new RegExp("^(?=.{8,})");

const checkValidity = () => {
  const password = document.getElementById("companySignupPassword").value;
  const confirmPassword = document.getElementById("confirmPasswordInput").value;

  const fulfilled = [];
  const unfulfilled = [];

  upperCaseRegex.test(password)
    ? fulfilled.push(document.getElementById("upperCaseRequirement"))
    : unfulfilled.push(document.getElementById("upperCaseRequirement"));

  specialCharacterRegex.test(password)
    ? fulfilled.push(document.getElementById("specialCharacterRequirement"))
    : unfulfilled.push(document.getElementById("specialCharacterRequirement"));

  password && password === confirmPassword
    ? fulfilled.push(document.getElementById("passwordsMatchRequirement"))
    : unfulfilled.push(document.getElementById("passwordsMatchRequirement"));

  fulfilled.forEach((el) => {
    el.classList.remove("unfulfilled");
    el.classList.add("fulfilled");
  });
  unfulfilled.forEach((el) => {
    el.classList.remove("fulfilled");
    el.classList.add("unfulfilled");
  });

  if (fulfilled.length === 3)
    document.getElementById("submitBtn").disabled = false;
  else document.getElementById("submitBtn").disabled = true;
};

Array.from(document.getElementsByClassName("input-listener")).forEach(
  (input) => {
    input.addEventListener("keyup", checkValidity);
  }
);

// autofill URLslug with companyname
$(document).ready(function () {
  $("#companyName").keyup(function () {
    update();
  });
  function update() {
    $("#companyUrlSlug").val($("#companyName").val());
  }
});

// Login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get user info
  const email = loginForm["login-email"].value;
  const password = loginForm["login-password"].value;

  //Login user
  auth.signInWithEmailAndPassword(email, password).then(() => {
    loginForm.reset();
    location.reload();
  });
});

// Reset forgotten password
$("#forgotPassword").on("click", (e) => {
  e.preventDefault();
  $(".resetPasswordBox").show();
  $(".resetPasswordHide").hide();
});
$("#regretPasswordReset").on("click", (e) => {
  e.preventDefault();
  $(".resetPasswordBox").hide();
  $(".resetPasswordHide").show();
});

$("#resetPassword").on("click", (e) => {
  e.preventDefault();
  const resetPwEmail = $("#mail").val();
  const actionCodeSettings = {
    url: "https://talentforms.com/",
  };
  auth
    .sendPasswordResetEmail(resetPwEmail, actionCodeSettings)
    .then(function () {
      alert("Email successfully sent");
    })
    .catch(function (error) {
      alert("something went wrong");
    });
});

// Logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut();
});

// Retrieve firebase data
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const accountDetails = document.querySelector("#modal-account");

const setupUI = (user) => {
  if (user) {
    // Account information
    const html = `
        <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Account Information</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
        <div class="text-center"><h4>Logged in as: ${user.email}</h4></div>
        </div>
        <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-secondary shadow-sm" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
        `;
    accountDetails.innerHTML = html;

    // If user is logged in show/hide
    loggedInLinks.forEach((item) => (item.style.display = "block"));
    loggedOutLinks.forEach((item) => (item.style.display = "none"));
  } else {
    // If user is logged out show/hide
    accountDetails.innerHTML = "";
    loggedInLinks.forEach((item) => (item.style.display = "none"));
    loggedOutLinks.forEach((item) => (item.style.display = "block"));
  }
};

// Listen for auth status changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // Get data from firestore to application table & modal
    db.collection("companies")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const companyName = doc.data().urlslug;

        db.collection("applications")
          .where("companyname", "==", companyName)
          .onSnapshot((snapshot) => {
            setupTalentformList(snapshot.docs);
          });

        // Get data from firestore to applications
        db.collection("applications")
          .where("companyname", "==", companyName)
          .onSnapshot((snapshot) => {
            setupTalentformTable(snapshot.docs);
          });
      });

    setupUI(user);
  } else {
    // setupTalentformTable([]);
    setupTalentformList([]);
    setupUI();
  }
});

// Date
const timesamp = Date.now();
const newdate = new Date();

let year = newdate.getFullYear();
let month = newdate.getMonth(); // January = 0 not 1 (why +1 on datestring)
let date = newdate.getDate();
let hour = newdate.getHours();
let minute = newdate.getMinutes();

let datestring = year + "-" + (month + 1) + "-" + date;

// Save Talentform to db
const saveTalentform = $(document).find("#saveTalentform");
$(saveTalentform).on("submit", (e) => {
  e.preventDefault();
  var uid = auth.currentUser.uid;
  db.collection("talentforms")
    .doc(uid)
    .update({
      headline: $("#headline1").text(),
      description: $("#description1").text(),
      question_1: $("#lab1").text(),
      question_2: $("#lab2").text(),
      question_3: $("#lab3").text(),
      question_4: $("#lab4").text(),
      question_5: $("#lab5").text(),
      updated: datestring,
    })
    .then(() => {
      // reset form
      $(saveTalentform)[0].reset();

      // Show alert
      $(document).find(".alert-save").show();
      $(document).find(".show").hide();
      setTimeout(function () {
        $(document).find(".alert-save").hide();
        $(document).find(".show").show();
      }, 3000);
    });
});

// Retrieve firebase data to application table (IN COMPANY MODAL)
const talentformTable = document.querySelector("#table-application");
const setupTalentformTable = (data) => {
  if (data) {
    let html = "";
    data.forEach((doc) => {
      const application = doc.data();
      const modalName = `#modalApplication${doc.id}`;
      const tr = `
        <tr>
            <td scope="row">
            ${application.headline}
            </td>
            <td>
            <a class="nounderline" href="#" data-toggle="modal" data-target="${modalName}">
            ${application.fullname}
            </a>
            </td>
            <td>
            ${application.created}
            </td>
        </tr>
        `;
      html += tr;
    });
    talentformTable.innerHTML = html;
  }
};

// Retrieve firebase data into into "application modal"
//const talentformList = document.querySelector('#modal-application-1');
const setupTalentformList = (data) => {
  data.forEach((doc) => {
    const talentform = doc.data();
    let html = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Application</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
          </button>
        </div>
      <div class="modal-body">
        <form action="" class="form-style">
          <div class="form-row form-group align-items-center">
            <div class="col">
              <label for="name">Full name</label>
               <p>${talentform.fullname}</p>
            </div>
            <div class="col">
                <label for="email">Email address</label>
                <p><a class="nounderline" href="mailto:${talentform.email}">${talentform.email}</a></p>
            </div>
          </div>
          <div class="form-group form-row">
            <div class="col">
            <label for="linkedin">Linkedin profile</label>
            <p><a class="nounderline" href="${talentform.linkedin}" target="_blank">Open Profile</a></p>
            </div>
            <div class="col">
            <label for="homepage">Homepage</label>
            <p><a class="nounderline" href="${talentform.homepage}" target="_blank">Open Homepage</a></p>
            </div>
          </div>
          <div class="form-group">
            <label>${talentform.answer_1}</label>
            <p>${talentform.question_1}</p>
          </div>
          <div class="form-group">
            <label>${talentform.answer_2}</label>
            <p>${talentform.question_2}</p>
          </div>
          <div class="form-group">
                  <label>${talentform.answer_3}</label>
                  <p>${talentform.question_3}</p>
              </div>
          <div class="form-group">
          <label>${talentform.answer_4}</label>
          <p>${talentform.question_4}</p>
          </div>
          <div class="form-group">
          <label>${talentform.answer_5}</label>
          <p>${talentform.question_5}</p>
          </div>
          </form>
      </div>
            <div class="modal-footer justify-content-center">
                <button type="button" class="btn btn-secondary shadow-sm" data-dismiss="modal">Close</button>
            </div>
          </div>
      </div>
      `;

    const modal = document.createElement("div");
    const modalName = `modalApplication${doc.id}`;
    modal.setAttribute("id", modalName);
    modal.className = "modal fade";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = html;
    document.body.appendChild(modal);
  });
};

// h3 editable text
$(document).on("click", "h3.editable2", function () {
  var $lbl = $(this),
    x = $lbl.text(),
    $txt = $(
      '<input type="text" class="editable-label-text form-control form-control-2" value="' +
        x +
        '"/>'
    );
  $lbl.replaceWith($txt);
  $txt.focus();

  $txt
    .blur(function () {
      $txt.replaceWith($lbl);
    })
    .keydown(function (evt) {
      if (evt.keyCode == 13) {
        var no = $(this).val();
        $lbl.text(no);
        $txt.replaceWith($lbl);
      }
      if ($lbl.text() === "") {
        return $lbl.text("Enter your job title");
      }
    });
});

// description editable text
$(document).on("click", "h6.editable3", function () {
  var $lbl = $(this),
    x = $lbl.text(),
    $txt = $(
      '<input type="text" class="editable-label-text form-control form-control-3" value="' +
        x +
        '"/>'
    );
  $lbl.replaceWith($txt);
  $txt.focus();

  $txt
    .blur(function () {
      $txt.replaceWith($lbl);
    })
    .keydown(function (evt) {
      if (evt.keyCode == 13) {
        var no = $(this).val();
        $lbl.text(no);
        $txt.replaceWith($lbl);
      }
      if ($lbl.text() === "") {
        return $lbl.text("Enter the job description");
      }
    });
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const docRef = db.collection("talentforms").doc(user.uid);
    docRef.get().then(function (doc) {
      if (doc.exists) {
        const talentforms = doc.data();

        const talentformEditable = document.querySelector("#saveTalentform");
        let html = `
      <div class="application-style-2">
          <div class="row-1 justify-content-start">
            <div class="col application-h4-center">
              <small><button type="button" id="toggleinfo" class="btn btn-link">Info</button></small>
            </div>
          </div>
      </div>

      <div class="cover-container-2 cover-container-6 text-center">
      <div class="col-sm profile-container-btm-margin" >
        <div id="profile-container">
        <image id="profileImage" src="${talentforms.logo}"/>
        </div>
        <input id="imageUpload" type="file" value="upload"/>
        <progress value="0" max="100" id="uploader">0%</progress>
      </div>
      </div>
      </div>

      <div class="cover-container-2 cover-container-6 text-center">
      <div><h3 id="headline1" class="editable2">${talentforms.headline}</h3></div>
      <div><h6 id="description1" class="editable3">${talentforms.description}</h6></div>
      <div><small><p>${talentforms.companyname}</p></small></div>
      </div>

   
      <div class="form-row form-group align-items-center">
      <div class="col">
      <label id="fullname">Full name</label>
      <input type="input" class="form-control shadow-sm" id="name" disabled/>
      </div>
      <div class="col">
      <label id ="email">Email adress</label>
      <input type="email" class="form-control shadow-sm" id="email" disabled/>
      </div>
      </div>

    
      <div class="form-row form-group align-items-center">
      <div class="col">
      <label id="homepage">Homepage</label>
      <input class="form-control shadow-sm" id="homepage" disabled/>
      </div>
      <div class="col">
      <label id="linkedin">Linkedin profile</label>
      <input class="form-control shadow-sm" id="linkedin" disabled/>
      </div>
      </div>
    
      <div class="div1 form-row">
      <div class="col cover-container-4">
      <div class="holder1"><label id="lab1" class="editable1" >${talentforms.question_1}</label></div>
      <input class="field-long form-control shadow-sm" disabled/>
      </div>
      </div>
    
    
      <div class="div2 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab2" class="editable1">${talentforms.question_2}</label></div>
      <input class="field-long form-control shadow-sm" disabled/>
      </div>
      </div>
    
    
      <div class="div3 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab3" class="editable1">${talentforms.question_3}</label></div>
      <input class="field-long form-control shadow-sm" disabled/>
      </div>
      </div>
    
    
      <div class="div4 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab4" class="editable1">${talentforms.question_4}</label></div>
      <input class="field-long form-control shadow-sm" disabled/>
      </div>
      </div>
    
    
      <div class="div5 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab5" class="editable1">${talentforms.question_5}</label></div>
      <input class="field-long form-control shadow-sm" disabled/>
      </div>
      </div>
      
      <div class="text-center alert alert-success alert-save">Your Talentform has successfully been updated!</div>
      
      <div class="form-row text-center form-button show">
      <div class="col-md">
      <a href="https://talentforms.com/${talentforms.urlslug}" target="_blank" type="button" class="btn btn-form btn-secondary btn-lg">Preview</a>
      </div>
      <div class="col-md">
      <button type="submit" class="btn_save btn btn-form btn-success btn-lg">Save</button>
      </div>
      </div>
      `;
        //output innerHTML
        talentformEditable.innerHTML = html;

        $("#uploader").hide();

        $("#profileImage").click(function (e) {
          $("#imageUpload").click();
        });

        //Get Elements
        var uploader = document.getElementById("uploader");
        var fileButton = document.getElementById("imageUpload");

        //Listen for file
        fileButton.addEventListener("change", function (e) {
          e.preventDefault();
          $("#uploader").show();

          //Get File
          var file = e.target.files[0];

          firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              const docRef = db.collection("companies").doc(user.uid);
              docRef.get().then(function (doc) {
                if (doc.exists) {
                  const talentforms = doc.data();
                  const company = talentforms.urlslug;
                  var storageRef = storage.ref(
                    "companyLogos" + "/" + company + "/" + "logo"
                  ); // Create a Storage Ref w/ username
                  var task = storageRef.put(file); // Upload file

                  //Update Progress Bar
                  task.on(
                    "state_changed",
                    function progress(snapshot) {
                      var percentage =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      uploader.value = percentage;
                      //if percentage = 100
                    },
                    function error(err) {
                      alert(err);
                    },
                    function complete() {
                      alert("Upload completed!");
                      location.reload();
                    }
                  );
                  storageRef.getDownloadURL().then(function (downloadUrl) {
                    db.collection("talentforms").doc(user.uid).update({
                      logo: downloadUrl,
                    });
                  });
                }
              });
            }
          });
        });

        $(document).find(".alert-save").hide();

        tippy("#profileImage", {
          content: "Click to upload company logo",
        });
        tippy("#headline1", {
          content: "Click to edit job title",
        });
        tippy("#description1", {
          content: "Click to edit job description",
        });
        tippy("#fullname", {
          content: "This text cannot be changed",
        });
        tippy("#linkedin", {
          content: "This text cannot be changed",
        });
        tippy("#homepage", {
          content: "This text cannot be changed",
        });
        tippy("#email", {
          content: "This text cannot be changed",
        });
        tippy("#lab1", {
          content: "Click to edit this question",
        });
        tippy("#lab2", {
          content: "Click to edit this question",
        });
        tippy("#lab3", {
          content: "Click to edit this question",
        });
        tippy("#lab4", {
          content: "Click to edit this question",
        });
        tippy("#lab5", {
          content: "Click to edit this question",
        });
        tippy("#toggleinfo", {
          trigger: "click",
          content:
            "This is your editable Talentform. Hover the labels for more info or click to edit.",
        });

        //Btn for saving form to db
        $(document).on("submit", ".btn_save", function (event) {
          event.preventDefault();
          var form_btn = $(document);
          form_btn.find(".show").show();
        });

        // Edit labels
        $(document).on("click", "label.editable1", function () {
          var $lbl = $(this),
            o = $lbl.text(),
            $txt = $(
              '<input type="text" class="editable-label-text form-control form-control-1" value="' +
                o +
                '" />'
            );
          $lbl.replaceWith($txt);
          $txt.focus();

          $txt
            .blur(function () {
              $txt.replaceWith($lbl);
            })
            .keydown(function (evt) {
              if (evt.keyCode == 13) {
                var no = $(this).val();
                $lbl.text(no);
                $txt.replaceWith($lbl);
              }
              if ($lbl.text() === "") {
                return $lbl.text(
                  "What do you want to ask people applying to your company?"
                );
              }
            });
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("TSCR");
      }
    });
  }
});

// Tooltips
tippy("#companyUrlSlug", {
  //call "tippy" + ID of content
  content: "This cannot be changed later", // Tooltips content
});
