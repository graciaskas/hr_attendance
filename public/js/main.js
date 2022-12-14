class HRAttendance {

  constructor() {
    
    let userForm = document.querySelector(".user-form");
    let modifyButton = userForm ? userForm.querySelector("button[type=button]") : null;

    let cancelButton = null;
    let submitButton = userForm ? userForm.querySelector("button[type=submit]") : null;

  

    if (modifyButton && submitButton) {
      cancelButton = modifyButton.nextElementSibling;;
      modifyButton.onclick = e => {
        e.preventDefault();

         //Get all input disabled and remove disabled attribute
        userForm.querySelectorAll("input[disabled]")
          .forEach(input => {
            input.removeAttribute('disabled');
          });

        //Modify its display behavior
        modifyButton.classList.add("d-none");

        //display cancel and save buttons
        cancelButton.classList.remove("d-none");
        submitButton.classList.remove("d-none");
        
      };
    }

    /** File upload */
    let inputFile = document.querySelector("input[type=file]");
    let fileUploader = document.querySelector(".fileUploader");
    let imageDisplay = fileUploader.querySelector("img");
    let serverFile = document.querySelector("input[name=image]");
    if (fileUploader) {
      fileUploader.onclick = e => {
        inputFile.click();
      };

      inputFile.onchange = async e => {
        let file = e.target.files[ 0 ];
        let size = Math.floor(file.size / 1024  );
        let base64 = await HRAttendance.getBase64(file);
        //serverFile.value = base64;
       
        if (size > 2000) {
          window.alert("Image size should not be greater than 2mb");
          return;
        }

        serverFile.value = base64;
        imageDisplay.src = base64
      }
    }
  }

  static getBase64 = (file) => { 
    return new Promise( (resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  static init() {
    
    let getRoutes = [
      "/employees",
      "/users",
      "/attendances",
      "/departments",
      "/login",
      "/reset",
    ];

    //Get locations
    let pathName = window.location.pathname.split('/')[ 1 ];
    let currentLocation = "/" + pathName;

    //Manage according to location;
    if (currentLocation == "/attendances") {
      this.checkIn(); //Handle checkIn
      this.checkOut(); //Handle checkOut
    }


    this.searchSelect();
  }

  static createDepartment() {
    
  }

  static createEmployee() {
    
  }

  static createUser() {
    
  }

  static createAttendance() {
    
  }

  static searchItem() {
    
  }

  static searchSelect() {
    let inputSelects = document.querySelectorAll(".inputSelect");

    inputSelects.forEach(input => {

      //Select list | should be the last element;
      let selectList = input.nextElementSibling;
      
      //input route request
      let route = input.getAttribute("data-route");
      
      //input hidden -> current element to handle id;
      //Should be the first element
      let inputHidden = input.parentNode.firstElementChild;

      input.addEventListener("keyup", async e => {
        let val = e.target.value;

        if(val != null && val !== "") {
          selectList.classList.remove('d-none');
        } else {
          selectList.classList.add('d-none');
        }

        try {
          let response = await window.fetch(`http://localhost:5000/api/${route}/?q=${val}`);
          let results = await response.json();

          if (response.status == 200) {
            if (results.data) results = results.data;

            if(val === "")  selectList.innerHTML = "";

            if(results.length){
              //Clear list
              selectList.innerHTML = "";
                
              //Create elements for the list
              results.forEach(element => {
                let item = document.createElement("li");
                item.innerText = element.name;
                item.id = element.id;
                selectList.appendChild(item);
                //onclick list element bind value to input
                item.onclick = e => { 
                  input.value = item.innerText;   
                  inputHidden.value = item.id;
                  selectList.classList.add('d-none');
                  selectList.innerHTML = "";
                }
                
              });            
            } else {
              //Clear list
              selectList.innerHTML = "";
              let item = document.createElement("li");
              item.innerText = `No results for ${val}`;
              selectList.appendChild(item);
            }

          } else {
            throw results;
          }
        } catch (error) {
          console.log(error);
        } 
        
      });

    });

  }

  static  checkIn() {
    let CheckInButtom = document.querySelector(".CheckInButtom");
    let checkinInput = document.querySelector("input[name=checkin]");
    let alert = document.querySelector(".alert");

    if (!CheckInButtom) return;

    CheckInButtom.addEventListener("click", async (e) => {
      let checkIn = new Date();

      checkinInput.value = checkIn.toLocaleString();
      
      alert.classList.remove("d-none");
      alert.innerText = `You have Checked In At ${new Date().toLocaleString()} | Please wait !`;

      try {
        setTimeout(() => {
          //window.location.href = "/attendances";
          let form = document.querySelector("form");
          form.submit();
        }, 3000);
        //Remove button from view
        CheckInButtom.remove();
      } catch (error) {
        console.log(error);
      }
    });
  }

  static checkOut() {

    let CheckOutButtom = document.querySelector(".CheckOutButtom");
    let checkOutInput = document.querySelector("input[name=checkout]");
    let alert = document.querySelector(".alert");
    let form = document.querySelector("form");

    if (!CheckOutButtom) return;

    CheckOutButtom.addEventListener("click", async (e) => {
      let checkOut = new Date();

      checkOutInput.value = checkOut.toLocaleString();
      
      alert.classList.remove("d-none");
      alert.innerText = `Good Bye ! You have Checked Out At ${checkOut.toLocaleString()}.\n Please wiat !`;

      try {
        form.action = "/api/attendances/?action=update"
        setTimeout(() => {
          form.submit();
        }, 3000);
        //Remove button from view
        CheckOutButtom.remove();
      } catch (error) {
        console.log(error);
      }
    })

  }
}

//Document is ready
window.addEventListener("DOMContentLoaded", e => {
  const App = new HRAttendance();
  
  //Initialize app
  HRAttendance.init();
   
});