/**
 * Dummy "happy parents" who claim free personalisation in the cart FOMO card.
 * Avatars are emoji-only (no network calls) so the strip stays light.
 */
const FOMO_USERS = [
  { name: "Priya", city: "Bangalore", emoji: "👩", color: "#FF6B6B" },
  { name: "Rahul", city: "Pune", emoji: "🧔", color: "#4ECDC4" },
  { name: "Meena", city: "Chennai", emoji: "👩‍🦱", color: "#FFB347" },
  { name: "Anjali", city: "Hyderabad", emoji: "👧", color: "#FF8FAB" },
  { name: "Deepa", city: "Mumbai", emoji: "👩‍🦰", color: "#A685E2" },
  { name: "Kavya", city: "Mysore", emoji: "🧕", color: "#F7B267" },
  { name: "Suma", city: "Kochi", emoji: "👩‍🦳", color: "#7FB069" },
  { name: "Nisha", city: "Delhi", emoji: "👩", color: "#F25C54" },
  { name: "Rohan", city: "Ahmedabad", emoji: "🧑", color: "#5BC0BE" },
  { name: "Vikram", city: "Jaipur", emoji: "🧔‍♂️", color: "#8D99AE" },
  { name: "Preethi", city: "Coimbatore", emoji: "👩‍🦱", color: "#E07A5F" },
  { name: "Arjun", city: "Mangalore", emoji: "🧑‍🦲", color: "#81B29A" },
  { name: "Lakshmi", city: "Salem", emoji: "👵", color: "#F2CC8F" },
  { name: "Aditi", city: "Kolkata", emoji: "👩", color: "#E36588" },
  { name: "Karthik", city: "Visakhapatnam", emoji: "🧑", color: "#3D5A80" },
  { name: "Sneha", city: "Surat", emoji: "👩‍🦱", color: "#EE6C4D" },
  { name: "Manoj", city: "Lucknow", emoji: "🧔", color: "#293241" },
  { name: "Pooja", city: "Indore", emoji: "🧕", color: "#F4A261" },
  { name: "Vivek", city: "Patna", emoji: "🧑‍🦰", color: "#2A9D8F" },
  { name: "Divya", city: "Bhopal", emoji: "👩", color: "#E76F51" },
  { name: "Sanjay", city: "Nagpur", emoji: "🧔‍♂️", color: "#264653" },
  { name: "Asha", city: "Hubli", emoji: "👵", color: "#F3722C" },
  { name: "Naveen", city: "Trichy", emoji: "🧑", color: "#90BE6D" },
  { name: "Geetha", city: "Madurai", emoji: "👩‍🦰", color: "#577590" },
  { name: "Amit", city: "Vadodara", emoji: "🧔", color: "#43AA8B" },
  { name: "Ritu", city: "Ranchi", emoji: "👩", color: "#F9C74F" },
  { name: "Suresh", city: "Guwahati", emoji: "🧔‍♂️", color: "#F8961E" },
  { name: "Bhavana", city: "Belgaum", emoji: "🧕", color: "#F94144" },
  { name: "Hari", city: "Tirupati", emoji: "🧑‍🦱", color: "#F3722C" },
  { name: "Shilpa", city: "Goa", emoji: "👩‍🦳", color: "#B5179E" },
  { name: "Tarun", city: "Chandigarh", emoji: "🧑", color: "#7209B7" },
  { name: "Megha", city: "Dehradun", emoji: "👩", color: "#560BAD" },
  { name: "Kiran", city: "Shimla", emoji: "🧔", color: "#3A0CA3" },
  { name: "Priti", city: "Agra", emoji: "👩‍🦱", color: "#4361EE" },
  { name: "Mohan", city: "Varanasi", emoji: "🧔‍♂️", color: "#4895EF" },
  { name: "Anita", city: "Allahabad", emoji: "🧕", color: "#4CC9F0" },
  { name: "Gaurav", city: "Kanpur", emoji: "🧑‍🦰", color: "#06D6A0" },
  { name: "Sonal", city: "Meerut", emoji: "👩", color: "#118AB2" },
  { name: "Vivaan", city: "Faridabad", emoji: "🧑", color: "#073B4C" },
  { name: "Reena", city: "Gurgaon", emoji: "👩‍🦰", color: "#FFD166" },
  { name: "Krishna", city: "Noida", emoji: "🧔", color: "#EF476F" },
  { name: "Maya", city: "Vijayawada", emoji: "👩‍🦱", color: "#FF6F61" },
  { name: "Ravi", city: "Warangal", emoji: "🧑‍🦲", color: "#FFA8A8" },
  { name: "Sahana", city: "Davangere", emoji: "🧕", color: "#FF8FA3" },
  { name: "Yash", city: "Nashik", emoji: "🧔‍♂️", color: "#FFCAD4" },
  { name: "Charan", city: "Vellore", emoji: "🧑", color: "#A8DADC" },
  { name: "Lavanya", city: "Erode", emoji: "👩", color: "#457B9D" },
  { name: "Aman", city: "Jodhpur", emoji: "🧔", color: "#1D3557" },
  { name: "Bhavya", city: "Udaipur", emoji: "👩‍🦱", color: "#E63946" },
  { name: "Tejas", city: "Raipur", emoji: "🧑‍🦰", color: "#F1FAEE" },
];

export default FOMO_USERS;

/** Pick `count` distinct users starting from `startIndex` (wraps). */
export const pickUsers = (count, startIndex = 0) => {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(FOMO_USERS[(startIndex + i) % FOMO_USERS.length]);
  }
  return out;
};

/** Random user that isn't in the `exclude` array (by name). */
export const randomUser = (exclude = []) => {
  const pool = FOMO_USERS.filter((u) => !exclude.includes(u.name));
  if (!pool.length) return FOMO_USERS[Math.floor(Math.random() * FOMO_USERS.length)];
  return pool[Math.floor(Math.random() * pool.length)];
};
