const addBtn = document.querySelector(".btn-add");
const clearBtn = document.querySelector(".btn-clear");
let titleInput = document.querySelector('.title-input');
let contextInput = document.querySelector('.context-input');

// const deleteBtns = document.querySelectorAll(".btn-delete");

fetch("https://usmanlive.com/wp-json/api/stories")
.then(res => res.json())
.then(data => 
{console.log(data);
showStories(data);
})
.catch(err => console.log("error in fetching data",err)
);

function loadStories(){
  fetch("https://usmanlive.com/wp-json/api/stories")
  .then(res => res.json())
  .then(data => 
  {console.log(data);
  showStories(data);
  })
  .catch(err => console.log("error in fetching data",err)
  );
}

clearText= () =>{
  console.log('clear clicked');
  titleInput.value = '';
  contextInput.value = '';
  titleInput.removeAttribute("update-story-id");
  addBtn.textContent = 'Add'
  }

const addStory = () => {
  console.log("add clicked");

  let title = titleInput.value.trim();
  let content = contextInput.value.trim();
  let updateId = titleInput.getAttribute('update-story-id') 

  if (title === "" || content === "") {
    alert("Please give complete details");
    return;
  }

  if (updateId){

    axios.put(`https://usmanlive.com/wp-json/api/stories/${updateId}`,{
      title: title,
      content: content
    })
    .then(res =>{
      console.log('story updated:',res.data);
      loadStories();
      clearText();
    })
    .catch(err => console.error("Error updating:", err));
  }
else{
  fetch("https://usmanlive.com/wp-json/api/stories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title: title, content: content })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Story added:", data);
      loadStories(); // refresh list
      titleInput.value = "";
      contextInput.value = "";
    })
    .catch(err => console.log("Error:", err));
  }
};
  

addBtn.addEventListener('click',addStory);
clearBtn.addEventListener('click',clearText);




function showStories(stories) {
    const apiBox = document.getElementById("api-data");
    apiBox.innerHTML = ""; // clear old data before adding new
  
    stories.forEach(story => {
      apiBox.innerHTML += `
        <div class="card" style="margin:10px;padding:10px;border:1px solid #ccc; background:white;">
          <h3>${story.title}</h3>
          <p>${story.content}</p>
          <button class="btn-update" data-id="${story.id}">Update</button>
          <button class="btn-delete" data-id="${story.id}">Delete</button>
        </div>
      `;
    });
  }
  


document.getElementById('api-data').addEventListener('click', function(e){
  if(e.target.classList.contains('btn-delete')){
    const id =  e.target.getAttribute('data-id');
    console.log(id + 'clicked');
    deleteStory(id);
  }
  if(e.target.classList.contains('btn-update')){
    const id =  e.target.getAttribute('data-id');
    const card = e.target.closest(".card");   // get parent of update button
    const title = card.querySelector("h3").textContent; // get the title text
    const content = card.querySelector("p").textContent; // get content text
    titleInput.value = title;
    contextInput.value = content;
   titleInput.setAttribute('update-story-id',id)    // set id to input if update story
   addBtn.textContent = 'Update';
  }
  
});

// axios method for requesting server to delete story

deleteStory = (id)=>{
 axios.delete(`https://usmanlive.com/wp-json/api/stories/${id}`)    
 .then(res =>{
  console.log(id + ' Story deleted', res);
  loadStories();
 })
 .catch(error => {
  console.error("Error deleting story:", error);
  alert("Failed to delete story!");
});
}

update =()=>{

}