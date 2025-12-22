import React, { useState, useMemo, useEffect } from 'react';
import {
Search,
AlertTriangle,
Info,
Stethoscope,
Activity,
ShieldCheck,
FileText,
Pill,
Calendar,
X,
ChevronRight,
ChevronDown,
ChevronUp,
Printer,
Download,
Plus,
Loader2,
Sparkles,
RefreshCw
} from 'lucide-react';

const DISEASE_DATABASE = [
{
id: 'type-2-diabetes',
name: 'Type 2 Diabetes',
aliases: ['Adult-onset diabetes', 'Non-insulin dependent diabetes'],
overview: 'Type 2 diabetes is a chronic condition that affects the way your body processes blood sugar (glucose). With type 2 diabetes, your body either resists the effects of insulin or doesn\'t produce enough insulin to maintain normal glucose levels.',
symptoms: ['Increased thirst', 'Frequent urination', 'Increased hunger', 'Fatigue', 'Blurred vision', 'Slow-healing sores'],
emergencySigns: ['Confusion', 'Extreme lethargy', 'Shortness of breath', 'Fruity-smelling breath'],
causes: 'Resistance to insulin or insufficient insulin production. Factors include genetics, weight, and inactivity.',
riskFactors: ['Weight', 'Inactivity', 'Family history', 'Age', 'Race/Ethnicity'],
complications: ['Heart disease', 'Nerve damage (neuropathy)', 'Kidney damage', 'Eye damage', 'Alzheimer\'s disease'],
prevention: ['Healthy eating', 'Physical activity', 'Weight loss', 'Avoiding long periods of inactivity'],
diagnosis: ['Glycated hemoglobin (A1C) test', 'Fasting blood sugar test', 'Oral glucose tolerance test'],
treatment: {
medications: ['Metformin', 'Sulfonylureas', 'Insulin'],
procedures: ['Bariatric surgery (weight-related)'],
lifestyle: ['Healthy diet', 'Regular exercise', 'Glucose monitoring']
},
preparation: ['Log symptoms', 'List medications', 'Note family history', 'Prepare questions']
},
{
id: 'hypertension',
name: 'Hypertension',
aliases: ['High Blood Pressure', 'HBP'],
overview: 'Hypertension is a condition where the force of the blood against your artery walls is high enough that it may cause health problems, such as heart disease and stroke.',
symptoms: ['Often no symptoms', 'Severe headaches', 'Shortness of breath', 'Nosebleeds'],
emergencySigns: ['Severe chest pain', 'Severe headache with confusion', 'Nausea/Vomiting', 'Severe anxiety'],
causes: 'Primary (gradual over time) or Secondary (caused by underlying kidney or thyroid issues).',
riskFactors: ['Age', 'Tobacco use', 'High salt diet', 'Alcohol consumption', 'Stress'],
complications: ['Heart attack', 'Stroke', 'Aneurysm', 'Heart failure', 'Kidney damage'],
prevention: ['Reduce sodium', 'Exercise', 'Limit alcohol', 'Manage stress'],
diagnosis: ['Blood pressure monitoring', 'Urine tests', 'ECG (Electrocardiogram)'],
treatment: {
medications: ['Diuretics', 'ACE inhibitors', 'Beta blockers'],
procedures: [],
lifestyle: ['DASH diet', 'Regular cardio', 'Sodium reduction']
},
preparation: ['Avoid caffeine before test', 'Track home readings', 'List stressors']
},
{
id: 'asthma',
name: 'Asthma',
aliases: ['Bronchial Asthma'],
overview: 'Asthma is a condition in which your airways narrow and swell and may produce extra mucus. This can make breathing difficult and trigger coughing and wheezing.',
symptoms: ['Shortness of breath', 'Chest tightness', 'Wheezing', 'Coughing attacks'],
emergencySigns: ['Rapid worsening of SOB', 'No improvement after inhaler', 'Inability to speak in full sentences'],
causes: 'A combination of environmental and genetic factors. Triggers include pollen, dust mites, or cold air.',
riskFactors: ['Family history of asthma', 'Allergies', 'Being overweight', 'Exposure to smoke'],
complications: ['Permanent narrowing of bronchial tubes', 'Severe asthma attacks', 'Sleep disruption'],
prevention: ['Identify/avoid triggers', 'Get vaccinated for flu', 'Monitor breathing patterns'],
diagnosis: ['Spirometry', 'Peak flow tests', 'Methacholine challenge'],
treatment: {
medications: ['Inhaled corticosteroids', 'Quick-relief inhalers', 'Biologics'],
procedures: ['Bronchial thermoplasty'],
lifestyle: ['Home trigger reduction', 'Asthma Action Plan']
},
preparation: ['Identify triggers', 'Log attack frequency', 'Bring inhaler to visit']
},
{
id: 'gerd',
name: 'GERD',
aliases: ['Acid Reflux', 'Gastroesophageal Reflux Disease'],
overview: 'GERD occurs when stomach acid frequently flows back into the tube connecting your mouth and stomach (esophagus).',
symptoms: ['Heartburn', 'Chest pain', 'Difficulty swallowing', 'Regurgitation of food'],
emergencySigns: ['Severe chest pain (mimics heart attack)', 'Difficulty breathing', 'Persistent vomiting'],
causes: 'Frequent acid reflux, often due to a weak lower esophageal sphincter.',
riskFactors: ['Obesity', 'Pregnancy', 'Smoking', 'Hiatal hernia', 'Large meals late at night'],
complications: ['Esophageal stricture', 'Esophageal ulcer', 'Barrett\'s esophagus'],
prevention: ['Maintain weight', 'Stop smoking', 'Avoid trigger foods', 'Don\'t lie down after meals'],
diagnosis: ['Upper endoscopy', 'pH probe test', 'Esophageal manometry'],
treatment: {
medications: ['Antacids', 'H2 blockers', 'Proton pump inhibitors (PPIs)'],
procedures: ['Fundoplication', 'LINX device'],
lifestyle: ['Smaller meals', 'Elevate head of bed', 'Avoid tight clothing']
},
preparation: ['List trigger foods', 'Note time of symptoms', 'Record medication effectiveness']
},
{
id: 'stroke',
name: 'Stroke',
aliases: ['Brain Attack', 'CVA'],
overview: 'A stroke occurs when the blood supply to part of your brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients.',
symptoms: ['Trouble speaking', 'Numbness of face/arm/leg', 'Trouble seeing', 'Sudden severe headache'],
emergencySigns: ['F.A.S.T: Face drooping, Arm weakness, Speech difficulty, Time to call 911'],
causes: 'Blocked artery (ischemic stroke) or leaking/bursting of a blood vessel (hemorrhagic stroke).',
riskFactors: ['High blood pressure', 'Smoking', 'Diabetes', 'High cholesterol'],
complications: ['Paralysis', 'Memory loss', 'Emotional problems', 'Pain'],
prevention: ['Control BP', 'Quit tobacco', 'Healthy weight', 'Manage diabetes'],
diagnosis: ['CT scan', 'MRI', 'Carotid ultrasound', 'Echocardiogram'],
treatment: {
medications: ['tPA (clot buster)', 'Blood thinners', 'Statins'],
procedures: ['Endovascular procedures', 'Carotid endarterectomy'],
lifestyle: ['Physical therapy', 'Occupational therapy', 'Speech therapy']
},
preparation: ['Note exact time symptoms started', 'List all medications', 'Bring family member']
},
{
id: 'osteoarthritis',
name: 'Osteoarthritis',
aliases: ['OA', 'Degenerative joint disease', 'Wear-and-tear arthritis'],
overview: 'Osteoarthritis occurs when the protective cartilage that cushions the ends of the bones wears down over time. It can affect any joint but typically affects hands, knees, hips and spine.',
symptoms: ['Joint pain', 'Stiffness', 'Tenderness', 'Loss of flexibility', 'Grating sensation'],
emergencySigns: ['Joint redness/fever (signs of infection)', 'Sudden inability to bear weight', 'Severe swelling'],
causes: 'Cartilage deterioration due to aging, joint injury, or repeated stress.',
riskFactors: ['Older age', 'Obesity', 'Joint injuries', 'Genetics', 'Metabolic diseases'],
complications: ['Chronic pain', 'Disability', 'Difficulty with daily tasks', 'Sleep interference'],
prevention: ['Maintain healthy weight', 'Regular low-impact exercise', 'Control blood sugar'],
diagnosis: ['Physical exam', 'X-rays', 'MRI', 'Lab tests of joint fluid'],
treatment: {
medications: ['Acetaminophen', 'NSAIDs', 'Duloxetine'],
procedures: ['Cortisone injections', 'Joint replacement surgery'],
lifestyle: ['Weight loss', 'Physical therapy', 'Tai chi/Yoga']
},
preparation: ['Note which joints hurt most', 'List activities you avoid', 'Track stiffness times']
},
{
id: 'depression',
name: 'Depression',
aliases: ['Clinical Depression', 'Major Depressive Disorder'],
overview: 'Depression is a mood disorder that causes a persistent feeling of sadness and loss of interest. It affects how you feel, think and behave.',
symptoms: ['Feelings of sadness', 'Loss of interest in hobbies', 'Sleep disturbances', 'Tiredness', 'Appetite changes'],
emergencySigns: ['Suicidal thoughts', 'Planning self-harm', 'Severe withdrawal from reality'],
causes: 'Complex interaction of social, psychological and biological factors. Brain chemistry imbalances.',
riskFactors: ['Trauma', 'Family history', 'Chronic illness', 'Certain personality traits'],
complications: ['Excess weight/Obesity', 'Pain', 'Substance misuse', 'Social isolation'],
prevention: ['Manage stress', 'Early intervention', 'Build strong support networks'],
diagnosis: ['Physical exam', 'Psychiatric evaluation', 'DSM-5 criteria check'],
treatment: {
medications: ['SSRIs', 'SNRIs', 'Tricyclic antidepressants'],
procedures: ['Psychotherapy (CBT)', 'Light therapy', 'ECT'],
lifestyle: ['Regular exercise', 'Avoid alcohol', 'Set small daily goals']
},
preparation: ['Journal your moods', 'Note major life changes', 'Prepare to talk about family history']
},
{
id: 'copd',
name: 'COPD',
aliases: ['Chronic Obstructive Pulmonary Disease', 'Emphysema', 'Chronic Bronchitis'],
overview: 'COPD is a chronic inflammatory lung disease that causes obstructed airflow from the lungs. It\'s typically caused by long-term exposure to irritating gases.',
symptoms: ['Shortness of breath', 'Wheezing', 'Chest tightness', 'Chronic cough with mucus'],
emergencySigns: ['Blue lips or fingernails', 'Confusion', 'Racing heart', 'Inability to breathe while sitting'],
causes: 'Long-term exposure to particulate matter, most often from cigarette smoke.',
riskFactors: ['Smoking', 'Asthma', 'Occupational exposure to chemicals', 'Alpha-1 deficiency'],
complications: ['Respiratory infections', 'Heart problems', 'Lung cancer', 'Depression'],
prevention: ['Quit smoking', 'Avoid second-hand smoke', 'Use respiratory protection at work'],
diagnosis: ['Spirometry', 'Chest X-ray', 'CT scan', 'Arterial blood gas'],
treatment: {
medications: ['Bronchodilators', 'Inhaled steroids', 'Antibiotics (for flare-ups)'],
procedures: ['Oxygen therapy', 'Pulmonary rehabilitation'],
lifestyle: ['Healthy eating', 'Stay active as possible', 'Avoid smoke/pollutants']
},
preparation: ['Note smoking history', 'Track daily shortness of breath', 'List inhaler frequency']
},
{
id: 'alzheimers',
name: 'Alzheimer\'s Disease',
aliases: ['AD', 'Senile Dementia'],
overview: 'Alzheimer\'s is a progressive neurologic disorder that causes the brain to shrink and brain cells to die. It is the most common cause of dementia.',
symptoms: ['Memory loss', 'Confusion with time/place', 'Difficulty with familiar tasks', 'Personality changes'],
emergencySigns: ['Sudden extreme confusion', 'Wandering/getting lost', 'Severe agitation/safety risk'],
causes: 'Brain protein failure disrupting cell work, leading to neuron death.',
riskFactors: ['Age', 'Family history', 'Down syndrome', 'Head trauma', 'Poor heart health'],
complications: ['Pneumonia', 'Falls', 'Malnutrition', 'Inability to self-care'],
prevention: ['Heart-healthy diet', 'Physical exercise', 'Social engagement', 'Lifelong learning'],
diagnosis: ['Neurological exam', 'Cognitive testing', 'MRI/PET scans'],
treatment: {
medications: ['Cholinesterase inhibitors', 'Memantine', 'Aducanumab'],
procedures: [],
lifestyle: ['Routine creation', 'Safe environment', 'Nutritious diet']
},
preparation: ['Bring a family member', 'List specific memory concerns', 'Note safety issues']
},
{
id: 'migraine',
name: 'Migraine',
aliases: ['Migraine Headache'],
overview: 'A migraine is a headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head, often with nausea and light sensitivity.',
symptoms: ['Throbbing pain', 'Sensitivity to light/sound', 'Nausea/Vomiting', 'Aura (visual flashes)'],
emergencySigns: ['Sudden thunderclap headache', 'Headache with fever/stiff neck', 'Weakness or numbness'],
causes: 'Changes in the brainstem and interaction with the trigeminal nerve.',
riskFactors: ['Family history', 'Age (peaks in 30s)', 'Sex (women more likely)', 'Stress'],
complications: ['Status migrainosus (prolonged attack)', 'Migrainous infarction'],
prevention: ['Regular sleep', 'Stress management', 'Identify/avoid trigger foods', 'Hydration'],
diagnosis: ['Physical/Neurological exam', 'MRI or CT scan'],
treatment: {
medications: ['Triptans', 'NSAIDS', 'Botox (preventative)', 'CGRP inhibitors'],
procedures: [],
lifestyle: ['Quiet dark room rest', 'Regular exercise', 'Biofeedback']
},
preparation: ['Keep a headache diary', 'List potential food triggers', 'Track cycle (if applicable)']
},
{
id: 'hyperlipidemia',
name: 'High Cholesterol',
aliases: ['Hyperlipidemia', 'Dyslipidemia'],
overview: 'High cholesterol is a condition where you have too many lipids (fats) in your blood. It can lead to fatty deposits in blood vessels, increasing heart disease risk.',
symptoms: ['Usually has no symptoms', 'Chest pain (if CAD develops)', 'Yellowish skin bumps (rare)'],
emergencySigns: ['Signs of heart attack', 'Signs of stroke', 'Sudden leg pain (clot)'],
causes: 'Unhealthy lifestyle, genetics, or underlying conditions like diabetes or kidney disease.',
riskFactors: ['Poor diet', 'Obesity', 'Lack of exercise', 'Smoking', 'Age'],
complications: ['Coronary artery disease', 'Heart attack', 'Stroke', 'Peripheral artery disease'],
prevention: ['Low-salt diet', 'Limit animal fats', 'Maintain healthy weight', 'Quit smoking'],
diagnosis: ['Lipid panel blood test'],
treatment: {
medications: ['Statins', 'Bile-acid-binding resins', 'Ezetimibe'],
procedures: [],
lifestyle: ['Heart-healthy diet', 'Regular aerobic exercise', 'Weight loss']
},
preparation: ['Fast for 9-12 hours before test', 'List family heart history', 'Note daily activity levels']
},
{
id: 'anxiety',
name: 'Anxiety Disorders',
aliases: ['GAD', 'Panic Disorder', 'Social Anxiety'],
overview: 'Anxiety disorders involve more than temporary worry. For people with these disorders, the anxiety does not go away and can get worse over time.',
symptoms: ['Restlessness', 'Rapid heart rate', 'Hyperventilation', 'Trouble concentrating', 'Panic attacks'],
emergencySigns: ['Panic attack with chest pain', 'Suicidal ideation', 'Inability to leave the house'],
causes: 'Genetics, brain chemistry, personality, and life events.',
riskFactors: ['Trauma', 'Stress buildup', 'Other mental health issues', 'Drugs/Alcohol'],
complications: ['Depression', 'Digestive issues', 'Chronic pain', 'Social isolation'],
prevention: ['Get help early', 'Stay active', 'Avoid alcohol/drugs', 'Keep a journal'],
diagnosis: ['Psychological evaluation', 'Comparison to DSM-5'],
treatment: {
medications: ['SSRIs', 'SNRIs', 'Benzodiazepines (short term)'],
procedures: ['Psychotherapy (CBT)', 'Biofeedback'],
lifestyle: ['Prioritize sleep', 'Regular exercise', 'Mindfulness/Meditation']
},
preparation: ['Identify physical symptoms', 'Note specific triggers', 'List all medications']
},
{
id: 'anemia',
name: 'Anemia',
aliases: ['Iron deficiency', 'Low iron', 'Low blood'],
overview: 'Anemia is a condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body\'s tissues.',
symptoms: ['Fatigue', 'Weakness', 'Pale or yellowish skin', 'Dizziness', 'Cold hands and feet'],
emergencySigns: ['Severe shortness of breath', 'Chest pain', 'Fainting'],
causes: 'Iron deficiency, vitamin deficiency, chronic inflammation, or bone marrow disease.',
riskFactors: ['Poor diet', 'Intestinal disorders', 'Menstruation', 'Pregnancy', 'Chronic illness'],
complications: ['Severe fatigue', 'Heart problems', 'Pregnancy complications', 'Death (in severe rare cases)'],
prevention: ['Eat iron-rich foods', 'Consume vitamin C', 'Multivitamin use'],
diagnosis: ['CBC (Complete Blood Count)', 'Iron/Ferritin blood tests'],
treatment: {
medications: ['Iron supplements', 'Vitamin B-12', 'Folic acid'],
procedures: ['Blood transfusion (severe cases)', 'Bone marrow transplant'],
lifestyle: ['Dietary changes', 'Stay hydrated']
},
preparation: ['Track energy levels', 'Note diet habits', 'List menstrual history (women)']
},
{
id: 'influenza',
name: 'Influenza',
aliases: ['The Flu', 'Seasonal Flu'],
overview: 'Influenza is a viral infection that attacks your respiratory system. Unlike a cold, the flu comes on suddenly and can be severe.',
symptoms: ['High fever', 'Aching muscles', 'Chills/Sweats', 'Dry cough', 'Nasal congestion'],
emergencySigns: ['Difficulty breathing', 'Chest pain', 'Severe weakness', 'Seizures'],
causes: 'Influenza viruses that spread through droplets when people talk, cough, or sneeze.',
riskFactors: ['Young children', 'Adults over 65', 'Weakened immune systems', 'Chronic illness'],
complications: ['Pneumonia', 'Bronchitis', 'Heart inflammation', 'Organ failure'],
prevention: ['Annual flu vaccine', 'Thorough hand washing', 'Avoiding crowds'],
diagnosis: ['Rapid flu test', 'Molecular assays'],
treatment: {
medications: ['Antivirals (Oseltamivir)', 'Pain relievers'],
procedures: [],
lifestyle: ['Bed rest', 'Increased fluids', 'Stay home']
},
preparation: ['Note the time symptoms started', 'Record highest temperature', 'List existing conditions']
},
{
id: 'hypothyroidism',
name: 'Hypothyroidism',
aliases: ['Underactive Thyroid', 'Low Thyroid'],
overview: 'Hypothyroidism is a condition in which your thyroid gland doesn\'t produce enough of certain crucial hormones.',
symptoms: ['Fatigue', 'Increased sensitivity to cold', 'Constipation', 'Dry skin', 'Weight gain'],
emergencySigns: ['Myxedema coma (extreme lethargy/hypothermia)', 'Confusion', 'Difficulty breathing'],
causes: 'Autoimmune disease (Hashimoto\'s), thyroid surgery, or radiation therapy.',
riskFactors: ['Women (more common)', 'Older age', 'Family history', 'Autoimmune disease history'],
complications: ['Goiter', 'Heart problems', 'Mental health issues', 'Infertility'],
prevention: ['No specific prevention, but early detection is key.'],
diagnosis: ['Blood tests (TSH and T4 levels)'],
treatment: {
medications: ['Levothyroxine (hormone replacement)'],
procedures: [],
lifestyle: ['Consistent medication timing', 'Regular follow-up testing']
},
preparation: ['List all supplements', 'Note energy level changes', 'Describe skin/hair changes']
}
];

const Section = ({ title, icon: Icon, children, colorClass = "text-blue-600" }) => {
const [isOpen, setIsOpen] = useState(true);

return (
<div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none print:mb-4">
<button
onClick={() => setIsOpen(!isOpen)}
className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left print:hidden" >
<div className="flex items-center gap-3">
<div className={`p-2 rounded-lg ${colorClass.replace('text', 'bg')}/10 ${colorClass}`}>
<Icon size={20} />
</div>
<h3 className="text-lg font-semibold text-slate-800">{title}</h3>
</div>
{isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
</button>

      <div className="hidden print:flex items-center gap-2 mb-2 border-b-2 border-slate-200 pb-1 mt-4">
        <Icon size={18} className={colorClass} />
        <h3 className={`text-md font-bold uppercase tracking-wide ${colorClass}`}>{title}</h3>
      </div>

      {(isOpen || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
        <div className="p-4 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 print:border-none print:p-0 print:text-black print:text-sm">
          {children}
        </div>
      )}
    </div>

);
};

export default function App() {
const [searchQuery, setSearchQuery] = useState('');
const [selectedDisease, setSelectedDisease] = useState(null);
const [showSearch, setShowSearch] = useState(true);
const [customDiseases, setCustomDiseases] = useState([]);
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState(null);

const fullDatabase = useMemo(() => [...DISEASE_DATABASE, ...customDiseases], [customDiseases]);

const filteredDiseases = useMemo(() => {
if (!searchQuery) return fullDatabase;
return fullDatabase.filter(d =>
d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
d.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
);
}, [searchQuery, fullDatabase]);

const handleSelect = (disease) => {
setSelectedDisease(disease);
setShowSearch(false);
window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleBack = () => {
setSelectedDisease(null);
setShowSearch(true);
setError(null);
};

const handlePrint = () => {
window.print();
};

const downloadTxtReport = () => {
if (!selectedDisease) return;

    const content = `

PATIENT EDUCATION REPORT: ${selectedDisease.name.toUpperCase()}
Generated by HealthLens Module

---

OVERVIEW:
${selectedDisease.overview}

SYMPTOMS:
${selectedDisease.symptoms.map(s => `- ${s}`).join('\n')}

EMERGENCY SIGNS:
${selectedDisease.emergencySigns.map(s => `[!] ${s}`).join('\n')}

CAUSES:
${selectedDisease.causes}

RISK FACTORS:
${selectedDisease.riskFactors.map(r => `- ${r}`).join('\n')}

COMPLICATIONS:
${selectedDisease.complications.map(c => `- ${c}`).join('\n')}

PREVENTION & SELF-CARE:
${selectedDisease.prevention.map(p => `- ${p}`).join('\n')}

DIAGNOSIS & TREATMENT:
Medications: ${selectedDisease.treatment.medications.join(', ')}
Procedures: ${selectedDisease.treatment.procedures.join(', ')}
Lifestyle: ${selectedDisease.treatment.lifestyle.join(', ')}

DOCTOR VISIT PREPARATION:
${selectedDisease.preparation.map((p, i) => `${i + 1}. ${p}`).join('\n')}

---

DISCLAIMER: This report is for educational purposes only.
It is not medical advice. Consult a physician for diagnosis.

---

    `;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDisease.id}_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

};

const generateWithAI = async () => {
if (!searchQuery || isGenerating) return;
setIsGenerating(true);
setError(null);

    const apiKey = "";
    const systemPrompt = "You are a professional medical education assistant. Generate a highly structured, accurate, and patient-friendly disease overview in JSON format based on the user's query. Ensure terms are simple and avoid jargon where possible.";

    const userQuery = `Generate a medical overview for "${searchQuery}".
    Use the following exact JSON structure:
    {
      "name": "Proper Name",
      "aliases": ["Alternative Term 1", "Alternative Term 2"],
      "overview": "Clear 2-3 sentence description.",
      "symptoms": ["Symptom 1", "Symptom 2", ...],
      "emergencySigns": ["Emergency Sign 1", ...],
      "causes": "Explanation of how it happens.",
      "riskFactors": ["Factor 1", ...],
      "complications": ["Complication 1", ...],
      "prevention": ["Prevention 1", ...],
      "diagnosis": ["Test 1", ...],
      "treatment": {
        "medications": ["Class/Drug 1", ...],
        "procedures": ["Procedure 1", ...],
        "lifestyle": ["Advice 1", ...]
      },
      "preparation": ["Tip 1", ...]
    }`;

    let retries = 0;
    const maxRetries = 5;

    const performFetch = async (delay = 1000) => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!response.ok) throw new Error('API request failed');

        const result = await response.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) throw new Error('No content returned');

        const newDisease = JSON.parse(jsonText);
        const uniqueId = newDisease.name.toLowerCase().replace(/\s+/g, '-');

        const processedDisease = {
          ...newDisease,
          id: uniqueId,
          isAI: true
        };

        setCustomDiseases(prev => [...prev, processedDisease]);
        handleSelect(processedDisease);
      } catch (err) {
        if (retries < maxRetries) {
          retries++;
          setTimeout(() => performFetch(delay * 2), delay);
        } else {
          setError("Could not analyze this condition. Please check your spelling or try another search.");
        }
      } finally {
        if (retries >= maxRetries || !isGenerating) setIsGenerating(false);
      }
    };

    performFetch();

};

return (
<div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white print:text-black">
<header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm print:hidden">
<div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
<div className="bg-blue-600 p-2 rounded-lg text-white">
<Activity size={24} />
</div>
<h1 className="text-xl font-bold tracking-tight text-slate-800">HealthLens</h1>
</div>
{!showSearch && (
<button onClick={handleBack} className="p-2 text-slate-400 hover:text-slate-800">
<X size={24} />
</button>
)}
</header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 print:p-0">
        {showSearch ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Disease Library</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg md:text-xl">
                Explore verified conditions or search to generate a new AI-powered patient report.
              </p>
            </div>

            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
              <input
                type="text"
                placeholder="Type a disease or condition..."
                className="block w-full pl-14 pr-4 py-5 border-2 border-slate-200 rounded-3xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredDiseases.length === 0 && searchQuery.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 text-center animate-in zoom-in-95">
                <Sparkles size={40} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">"{searchQuery}" not in library</h3>
                <p className="text-slate-600 mb-6">Our system can analyze medical data to generate a custom patient guide for this condition.</p>
                <button
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50 transition-all"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                  {isGenerating ? "Analyzing..." : "Generate AI Report"}
                </button>
                {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiseases.map(disease => (
                <button
                  key={disease.id}
                  onClick={() => handleSelect(disease)}
                  className="flex flex-col p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left group relative overflow-hidden"
                >
                  {disease.isAI && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      <Sparkles size={10} /> AI GENERATED
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 pr-12">{disease.name}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed flex-grow">
                    {disease.overview}
                  </p>
                  <div className="mt-4 flex items-center text-blue-500 text-xs font-bold uppercase tracking-wider">
                    View Details <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="hidden print:block mb-8 border-b-4 border-blue-600 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase">Patient Education Guide</h1>
                  <p className="text-slate-600 font-medium">{selectedDisease.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">HealthLens Module</p>
                  <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4 print:bg-white print:border-slate-300 print:text-black">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5 print:text-black" size={24} />
              <div className="text-sm text-amber-900 leading-relaxed print:text-black">
                <span className="font-bold">Disclaimer:</span> This guide is for educational use only. It does not provide medical diagnosis or treatment advice. Consult a healthcare professional before making health decisions.
              </div>
            </div>

            <div className="mb-10 print:mb-6">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 print:text-3xl">{selectedDisease.name}</h2>
              <div className="flex flex-wrap gap-2 print:hidden">
                {selectedDisease.aliases.map(alias => (
                  <span key={alias} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full uppercase tracking-widest">
                    {alias}
                  </span>
                ))}
              </div>
            </div>

            <Section title="Overview" icon={Info} colorClass="text-blue-600">
              <p className="text-lg leading-relaxed print:text-sm">{selectedDisease.overview}</p>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 print:block">
              <Section title="Symptoms & Signs" icon={Activity} colorClass="text-indigo-600">
                <ul className="space-y-2">
                  {selectedDisease.symptoms.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 print:bg-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Emergency Signs" icon={AlertTriangle} colorClass="text-red-600">
                <div className="space-y-2">
                  {selectedDisease.emergencySigns.map((item, idx) => (
                    <div key={idx} className="bg-red-50 p-3 rounded-xl text-red-800 text-sm border-l-4 border-red-500 print:bg-white print:p-0 print:text-black print:border-none">
                      <span className="font-bold mr-2 print:inline hidden">!</span> {item}
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <Section title="Causes & Risks" icon={Stethoscope} colorClass="text-emerald-600">
              <p className="mb-6 leading-relaxed">{selectedDisease.causes}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:block">
                <div className="bg-slate-50 p-4 rounded-2xl print:bg-white print:p-0">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-3">Risk Factors</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedDisease.riskFactors.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl print:bg-white print:p-0 print:mt-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-3">Complications</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedDisease.complications.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            <Section title="Prevention & Care" icon={ShieldCheck} colorClass="text-cyan-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:block">
                {selectedDisease.prevention.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-cyan-50/50 p-4 rounded-2xl print:bg-white print:p-0 print:mb-2">
                    <ShieldCheck size={18} className="text-cyan-600 shrink-0 print:hidden" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Diagnosis & Treatment" icon={Pill} colorClass="text-purple-600">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Common Medications</h4>
                  <p className="text-sm">{selectedDisease.treatment.medications.join(', ') || 'Consult healthcare professional'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Lifestyle Options</h4>
                  <p className="text-sm">{selectedDisease.treatment.lifestyle.join(', ')}</p>
                </div>
                {selectedDisease.diagnosis && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Tests & Procedures</h4>
                    <p className="text-sm">{selectedDisease.diagnosis.join(', ')}</p>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Appointment Tips" icon={Calendar} colorClass="text-amber-600">
              <div className="grid grid-cols-1 gap-3 print:block">
                {selectedDisease.preparation.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl print:border-none print:p-0 print:mb-1">
                    <span className="text-xl font-black text-amber-200 print:text-black">{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pb-20 print:hidden">
              <button
                onClick={handleBack}
                className="flex-1 px-8 py-5 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Back to Library
              </button>

              <div className="flex flex-1 gap-2">
                <button
                  className="flex-1 px-4 py-5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 text-sm"
                  onClick={downloadTxtReport}
                >
                  <Download size={18} />
                  Download TXT
                </button>
                <button
                  className="flex-1 px-4 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                  onClick={handlePrint}
                >
                  <Printer size={18} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 py-12 px-6 mt-10 print:mt-10 print:bg-white print:border-t-2 print:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed print:text-black print:text-[8px]">
            © 2025 HealthLens AI Module. Disclaimer: This tool uses artificial intelligence to assist in patient education.
            Information should be cross-verified with a clinical professional. NOT A SUBSTITUTE FOR MEDICAL ADVICE.
          </p>
        </div>
      </footer>
    </div>

);
}
