// const docs = document.querySelectorAll("c-wiz div[data-target='doc']");

let link = document.location.href;
link = link.replace("https://drive.google.com/drive/u/", "");
let user = link.substr(0, link.indexOf("/"));

const obj = {};

const links = {};

const mimeType = {
  // "Google Docs": "https://docs.google.com/document/d/",
  // "Google Sheets": "https://docs.google.com/spreadsheets/d/",
  // "Google Drawings": "https://docs.google.com/drawings/d/",
  // "Google Forms": "https://docs.google.com/forms/d/",
  // "Google Slides": "https://docs.google.com/presentation/d/",
  // "Google Apps Script": `https://script.google.com/u/${user}/home/projects/`,
  // "Google Sites": `https://sites.google.com/u/${user}/`,
  "application/vnd.google-apps.document": "https://docs.google.com/document/d/",
  "application/vnd.google-apps.spreadsheet":
    "https://docs.google.com/spreadsheets/d/",
  "application/vnd.google-apps.drawing": "https://docs.google.com/drawings/d/",
  "application/vnd.google-apps.form": "https://docs.google.com/forms/d/",
  "application/vnd.google-apps.presentation":
    "https://docs.google.com/presentation/d/",
  "application/vnd.google-apps.script": `https://script.google.com/u/${user}/home/projects/`,
  "application/vnd.google-apps.site": `https://sites.google.com/u/${user}/`,
};

let render = false;

window.addEventListener("load", (event) => {
  render = true;
});

const createLink = (id, type, img) => {
  let driveLink;

  let shortcut = false;

  if (type == "file") {
    let fileType = img.src.substr(img.src.indexOf("application"));
    if(img?.alt.toLowerCase().indexOf("shortcut") >= 0){
      shortcut = true;
    }
    if (mimeType[fileType]) {
      driveLink = mimeType[fileType] + id;
    } else {
      driveLink = `https://drive.google.com/file/d/${id}`;
    }
    links[id] = {
      src: img.src,
      alt: img.alt,
    };
  } else {
    driveLink = `https://drive.google.com/drive/u/${user}/folders/${id}`;
  }

  let linkDiv = document.createElement(type);
  linkDiv.setAttribute("extensionId", id);
  linkDiv.onclick = () => {
    navigator.clipboard.writeText(driveLink);
  };


  linkDiv.innerHTML = `<button style="position: relative; z-index: 0; cursor: pointer;display: flex; background: transparent; align-items: center; justify-content: center; padding: 3px 15px 3px 11px; color: #1a73e8; border-color: #dadce0; border-radius: 0.25rem; font-family: 'Google Sans',Roboto,Arial,sans-serif; font-size: .875rem; letter-spacing: .0107142857em; font-weight: 500; text-transform: none; transition: border 280ms cubic-bezier(0.4,0,0.2,1),box-shadow 280ms cubic-bezier(0.4,0,0.2,1); box-shadow: none; border-width: 1px; width: max-content;">
                        <svg style="margin-right: 8px;" width="24" height="24" viewBox="0 0 24 24" focusable="false">
                          <path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"></path>
                        </svg>
                        <span>Copy link</span>
                      </button>`;

  if(shortcut){
    linkDiv.innerHTML = "";
  }

  return linkDiv;
};
// Using MutationObserver
let observer = new MutationObserver(function (mutations) {
  const docs = document.querySelectorAll("c-wiz div[data-target='doc']");
  let condition = false;
  let count = 0;
  mutations.forEach(function (mutation) {
    if (mutation.addedNodes.length) {
      if (
        mutation.addedNodes[0]?.nodeName != "FILE" &&
        mutation.addedNodes[0]?.nodeName != "FOLDER"
      ) {
        count++;
        console.log(mutation.addedNodes[0]?.nodeName);
      }
    } else if (mutation.removedNodes.length) {
      if (
        mutation.removedNodes[0]?.nodeName == "FILE" ||
        mutation.removedNodes[0]?.nodeName == "FOLDER"
      ) {
        let layout = document.querySelector('[aria-label="List layout"]');
        if (layout == null) {
          let id = mutation.removedNodes[0].attributes["extensionId"].value;
          mutation.target.appendChild(
            createLink(
              id,
              mutation.removedNodes[0]?.nodeName.toLowerCase(),
              links[id]
            )
          );
        }
      }
    }
  });

  if (count) {
    condition = true;
  }

  console.log(count, condition, mutations);

  if (condition && render) {
    let countNew = 0;
    let countNewB = 0;
    docs.forEach((v) => {
      let id = v.getAttribute("data-id");
      let row = v.querySelector('[role="gridcell"]');
      let type = "folder";
      let img = row.childNodes[0].querySelector("img");
      if (img) {
        type = "file";
      }

      let layout = document.querySelector('[aria-label="List layout"]');
      if (layout == null) {
        if (obj[id]) {
          let child = document.querySelector(`[extensionId='${id}']`);
          if (obj[id] != type || child == null) {
            if (child) {
              console.log(child, "romove", obj[id], type);
              child.remove();
            }

            v.appendChild(createLink(id, type, img));
            countNew++;
          }
        } else {
          obj[id] = type;
          v.appendChild(createLink(id, type, img));
          countNew++;
          countNewB++;
        }
      } else {
        // let child = row.querySelector(`[extensionId='${id}']`);
        // if(child){
        //   child.remove();
        // }
        // delete obj[id];
        // console.log("layout")
      }
    });

    console.log(docs.length, countNew, countNewB);
  }
});

let config = {
  childList: true,
  subtree: true,
};

observer.observe(document.body, config);

// docs.forEach((v) => {
//   let id = v.getAttribute("data-id");
//   if(v.querySelector("img")){
//     obj[`https://drive.google.com/file/d/${id}`] = true;
//     // console.log(`https://drive.google.com/file/d/${id}`, "is a file")
//   } else{
//     obj[`https://drive.google.com/drive/u/${link}/folders/${id}`] = true;
//     // console.log(`https://drive.google.com/drive/u/${link}/folders/${id}`, "is  a folders")
//   }
// })

// console.log(obj)
