// let ac_labs; - variabila ce se poate schimba in interiorul functiilor
// const ac_labs; - variabila ce nu se poate schimba in interiorul functiilor
// in javascript, datele se nu se declara ca tip int etc deoarece browserul isi da seama singur ce e;

// cu typescript TS - se declara tipul variabilei

//async await - asteapta ca o functie sa se termine inainte de a continua cu restul codului, de invatat , inteles, loopuri , functii asyncrone si sincrone
const setBackground = (id) => {
    const elements = document.getElementsByTagName("button"); 
  }
  
  document.getElementById("button1").addEventListener("click", () => {
    setBackground("button2");
  });