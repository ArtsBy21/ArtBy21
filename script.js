
/*
  LIVE BOOKING SETUP
  1. Create a Supabase project.
  2. Run the SQL from supabase.sql in Supabase SQL Editor.
  3. Put your Project URL and anon/publishable key below.
*/
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const SUPABASE_READY =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_ANON_KEY.includes("YOUR_");

let supabaseClient = null;
if (SUPABASE_READY && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const form=document.getElementById("bookingForm"),result=document.getElementById("bookingResult"),date=document.getElementById("date"),barber=document.getElementById("barber"),timeInput=document.getElementById("time"),timeSlots=document.getElementById("timeSlots");
const whatsappNumbers={"Toma — @21._toma":"40724696496","Albert — @21alberttt":"40768753876"};
const BOOKING_TIMES=["15:00","17:00","19:00","21:00"];
const today=new Date(),yyyy=today.getFullYear(),mm=String(today.getMonth()+1).padStart(2,"0"),dd=String(today.getDate()).padStart(2,"0");
date.min=`${yyyy}-${mm}-${dd}`;
document.querySelectorAll(".barber-select").forEach(link=>link.addEventListener("click",()=>{barber.value=link.dataset.barber;setTimeout(()=>document.getElementById("booking").scrollIntoView({behavior:"smooth"}),20);renderTimeSlots()}));
async function getBookedSlots(selectedBarber, day) {
  if (!supabaseClient) return [];
  const barberName = selectedBarber.split(" — ")[0];
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("booking_time")
    .eq("barber", barberName)
    .eq("booking_date", day);
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []).map(row => row.booking_time.slice(0,5));
}

async function renderTimeSlots(){
 timeSlots.innerHTML="";timeInput.value="";
 if(!barber.value||!date.value){timeSlots.innerHTML='<p class="slot-empty">Alege barberul și data pentru a vedea orele.</p>';return;}
 const booked = supabaseClient
   ? await getBookedSlots(barber.value, date.value)
   : JSON.parse(localStorage.getItem(`artby21_bookings_${barber.value}_${date.value}`)||"[]");

 BOOKING_TIMES.forEach(time=>{const b=document.createElement("button");b.type="button";b.className="time-slot";b.textContent=time;
  if(booked.includes(time)){b.disabled=true;b.classList.add("booked");b.textContent=`${time} — ocupat`;}
  b.addEventListener("click",()=>{document.querySelectorAll(".time-slot").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");timeInput.value=time;result.textContent=""});
  timeSlots.appendChild(b);
 });
}
barber.addEventListener("change",renderTimeSlots);date.addEventListener("change",renderTimeSlots);
form.addEventListener("submit",async e=>{e.preventDefault();
 const selectedBarber=barber.value,service=document.getElementById("service").value,day=date.value,time=timeInput.value,name=document.getElementById("name").value.trim(),contact=document.getElementById("contactField").value.trim();
 if(!selectedBarber||!service||!day||!time||!name||!contact){result.textContent="Completează toate câmpurile și alege o oră.";return;}
 const barberName=selectedBarber.split(" — ")[0],number=whatsappNumbers[selectedBarber];

 if (supabaseClient) {
   const { error } = await supabaseClient.from("bookings").insert({
     barber: barberName,
     booking_date: day,
     booking_time: time,
     client_name: name,
     contact: contact,
     service: service
   });
   if (error) {
     if (error.code === "23505") {
       result.textContent="Ora aceasta a fost deja rezervată de alt client.";
       await renderTimeSlots();
       return;
     }
     result.textContent="Nu am putut confirma rezervarea. Încearcă din nou.";
     return;
   }
 } else {
   const key=`artby21_bookings_${selectedBarber}_${day}`;
   const booked=JSON.parse(localStorage.getItem(key)||"[]");
   if(booked.includes(time)){renderTimeSlots();result.textContent="Ora aceasta a fost deja ocupată.";return;}
   booked.push(time);
   localStorage.setItem(key,JSON.stringify(booked));
 }
 const message=`Salut! Confirm o programare la ${barberName}.\n\nNume: ${name}\nServiciu: ${service}\nData: ${day}\nOra: ${time}\nTelefon / Instagram: ${contact}\n\nAș vrea să știu și prețul pentru serviciul ales.`;
 result.innerHTML=`Se deschide WhatsApp pentru <strong>${barberName}</strong>...`;
 const whatsappUrl=`https://wa.me/${number}?text=${encodeURIComponent(message)}`;
 window.location.assign(whatsappUrl);
});