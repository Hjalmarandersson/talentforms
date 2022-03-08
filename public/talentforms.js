// Make firestore & auth references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

//Tooltips
tippy('#linkedin', {
  content: 'https://linkedin.com/in/your-linkedin-profile',
});

// Date
const timesamp = Date.now();
const newdate = new Date();

let year = newdate.getFullYear();
let month = newdate.getMonth(); // January = 0 not 1 (why +1 on datestring)
let date = newdate.getDate();
let hour = newdate.getHours();
let minute = newdate.getMinutes();

let datestring = year + "-" +(month + 1)+ "-" + date;

// Save Applications to db
const saveApplication = document.querySelector('#saveApplication');
$(saveApplication).on('submit', (e) => {
  e.preventDefault();

  return db.collection('applications').doc().set({
  headline: $('#headline1').text(),
  fullname: $('#name').val(),
  email: $('#email').val(),
  linkedin: $('#linkedin').val(),
  homepage: $('#homepage').val(),
  question_1: $('#lab1').text(),
  answer_1: $('#inp1').val(),
  question_2: $('#lab2').text(),
  answer_2: $('#inp2').val(),
  question_3: $('#lab3').text(),
  answer_3: $('#inp3').val(),
  question_4: $('#lab4').text(),
  answer_4: $('#inp4').val(),
  question_5: $('#lab5').text(),
  answer_5: $('#inp5').val(),
  companyname: slug,
  created: datestring,
  }).then(() => {

    // reset form
    $(saveApplication)[0].reset();

    // Show alert
    $(document).find('.alert-save').show();
    $(document).find('.show').hide(); 
    setTimeout(function(){
      $(document).find('.alert-save').hide();
      $(document).find('.show').show();
    },3000);
    });
})





// 0. User goes to url: talentforms.com/cashflow
// 1. Fetch the slug from the URL: cashflow

// Slugify for URL's
const slugify = (string) => {
  const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
  const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
  const p = new RegExp(a.split('').join('|'), 'g')
    return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters in a with b
    .replace(/&/g, '-and-') // Replace & with ‘and’
    .replace(/[^\w-]+/g, '') // Remove all non-word characters such as spaces or tabs
    .replace(/--+/g, '-') // Replace multiple — with single -
    .replace(/^-+/, '') // Trim — from start of text
    .replace(/-+$/, ''); // Trim — from end of text
};

var slug = slugify(window.location.pathname);

db.collection('companies').where("urlslug", "==", slug).get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {

        var talentFormId = doc.id;
        db.collection("talentforms").doc(talentFormId).get().then(doc => {

      if (doc.exists) {
    const talentforms = doc.data();
    let html = `
    
      <div class="cover-container-2 cover-container-6 text-center">
      <div class="col-sm profile-container-btm-margin" >
      <div id="profile-container">
      <image src="${talentforms.logo}"/>
      </div>
      </div>
      </div>
        
      <div class="cover-container-2 cover-container-6 text-center">
      <div><h3 id="headline1">${talentforms.headline}</h3></div>
      <div><h6 id="description1">${talentforms.description}</h6></div>
      <div><small><p>${talentforms.companyname}</p></small></div>
      </div>
   
      <div class="form-row form-group align-items-center">
      <div class="col">
      <label>Full name</label>
      <input type="input" class="form-control shadow-sm" id="name" required/>
      </div>
      <div class="col">
      <label>Email adress</label>
      <input type="email" class="form-control shadow-sm" id="email" required/>
      </div>
      </div>
    
      <div class="form-row form-group align-items-center">
      <div class="col">
      <label>Homepage</label>
      <input class="form-control shadow-sm" id="homepage" required/>
      </div>
      <div class="col">
      <label>Linkedin profile</label>
      <input class="form-control shadow-sm" id="linkedin" required/>
      </div>
      </div>
    
      <div class="div1 form-row">
      <div class="col cover-container-4">
      <div><label id="lab1">${talentforms.question_1}</label></div>
      <input id="inp1" class="field-long form-control shadow-sm" required/>
      </div>
      </div>
    
    
      <div class="div2 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab2">${talentforms.question_2}</label></div>
      <input id="inp2" class="field-long form-control shadow-sm" required/>
      </div>
      </div>
    
    
      <div class="div3 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab3">${talentforms.question_3}</label></div>
      <input id="inp3" class="field-long form-control shadow-sm" required/>
      </div>
      </div>
    
    
      <div class="div4 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab4">${talentforms.question_4}</label></div>
      <input id="inp4" class="field-long form-control shadow-sm" required/>
      </div>
      </div>
    
    
      <div class="div5 form-row">
      <div class="col cover-container-4 ">
      <div><label id="lab5">${talentforms.question_5}</label></div>
      <input id="inp5" class="field-long form-control shadow-sm" required/>
      </div>
      </div>
      
      <div class="text-center alert alert-success alert-save">Your Talentform has successfully been updated!</div>       
                     
      <div class="form-row text-center form-button show">
      <div class="col-md">
      <button id="apply" type="submit" class="btn btn-form btn-success btn-lg btn_apply">Apply</button>
      </div>
      </div>
      `;
      //output innerHTML
      saveApplication.innerHTML = html;

      $(document).find('.alert-save').hide();


      }  else {
          alert("something went wrong")
          console.log("Something went wrong");
      }
    })
    });
  });
      