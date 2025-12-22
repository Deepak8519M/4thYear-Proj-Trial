import React, { useState, useMemo } from 'react';
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
Heart,
Brain,
Wind,
Frown,
Zap,
Eye,
Thermometer
} from 'lucide-react';

// Massive Database Expansion
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
overview: 'Hypertension is a condition where the force of the blood against your artery walls is high enough that it may cause heart disease or stroke.',
symptoms: ['Often no symptoms', 'Severe headaches', 'Shortness of breath', 'Nosebleeds'],
emergencySigns: ['Severe chest pain', 'Severe anxiety', 'Confusion', 'Seizures'],
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
emergencySigns: ['Rapid worsening of SOB', 'No improvement after inhaler', 'Blue tint to lips/fingernails'],
causes: 'A combination of environmental and genetic factors. Triggers include pollen, dust mites, or exercise.',
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
overview: 'GERD occurs when stomach acid frequently flows back into the tube connecting your mouth and stomach (esophagus). This backwash (acid reflux) can irritate the lining of your esophagus.',
symptoms: ['Heartburn', 'Chest pain', 'Difficulty swallowing', 'Regurgitation of food'],
emergencySigns: ['Severe chest pain (often mimics heart attack)', 'Difficulty breathing', 'Persistent vomiting'],
causes: 'Frequent acid reflux, often due to a weak lower esophageal sphincter.',
riskFactors: ['Obesity', 'Pregnancy', 'Smoking', 'Hiatal hernia', 'Large meals late at night'],
complications: ['Esophageal stricture', 'Esophageal ulcer', 'Barrett\'s esophagus'],
prevention: ['Maintain healthy weight', 'Stop smoking', 'Avoid trigger foods', 'Don\'t lie down after meals'],
diagnosis: ['Upper endoscopy', 'Ambulatory acid (pH) probe test', 'Esophageal manometry'],
treatment: {
medications: ['Antacids', 'H2 blockers', 'Proton pump inhibitors (PPIs)'],
procedures: ['Fundoplication', 'LINX device'],
lifestyle: ['Eat smaller meals', 'Elevate head of bed', 'Avoid tight clothing']
},
preparation: ['List trigger foods', 'Note time of symptoms', 'Record medication effectiveness']
},
{
id: 'coronary-artery-disease',
name: 'Coronary Artery Disease',
aliases: ['CAD', 'Heart Disease', 'Ischemic Heart Disease'],
overview: 'CAD develops when the major blood vessels that supply your heart become damaged or diseased. Cholesterol-containing deposits (plaque) in your coronary arteries are usually to blame.',
symptoms: ['Chest pain (angina)', 'Shortness of breath', 'Heart attack', 'Fatigue with activity'],
emergencySigns: ['Crushing chest pressure', 'Pain radiating to jaw/arm', 'Nausea/Cold sweats'],
causes: 'Damage or injury to the inner layer of a coronary artery, sometimes as early as childhood.',
riskFactors: ['Age', 'High blood pressure', 'High cholesterol', 'Smoking', 'Diabetes'],
complications: ['Heart attack', 'Heart failure', 'Arrhythmia'],
prevention: ['Quit smoking', 'Manage BP', 'Low-saturated fat diet', 'Regular cardio exercise'],
diagnosis: ['ECG', 'Echocardiogram', 'Stress test', 'Cardiac catheterization'],
treatment: {
medications: ['Statins', 'Aspirin', 'Beta blockers'],
procedures: ['Angioplasty and stent placement', 'Coronary artery bypass surgery'],
lifestyle: ['Heart-healthy diet', 'Weight management', 'Stress reduction']
},
preparation: ['Note activity-related pain', 'List family history of heart attacks', 'Record BP readings']
},
{
id: 'copd',
name: 'COPD',
aliases: ['Chronic Obstructive Pulmonary Disease', 'Emphysema', 'Chronic Bronchitis'],
overview: 'COPD is a chronic inflammatory lung disease that causes obstructed airflow from the lungs. It\'s typically caused by long-term exposure to irritating gases or particulate matter, most often from cigarette smoke.',
symptoms: ['Shortness of breath', 'Wheezing', 'Chest tightness', 'Chronic cough with mucus'],
emergencySigns: ['Blue/Gray lips', 'Rapid heartbeat', 'Confusion', 'Inability to speak in full sentences'],
causes: 'Tobacco smoking is the main cause in developed countries. Exposure to fuel fumes or dust in others.',
riskFactors: ['Smoking', 'Asthma history', 'Occupational exposure to dust/chemicals', 'Genetics (Alpha-1 antitrypsin deficiency)'],
complications: ['Respiratory infections', 'Heart problems', 'Lung cancer', 'Depression'],
prevention: ['Never smoke or quit immediately', 'Avoid second-hand smoke', 'Use protective gear at work'],
diagnosis: ['Pulmonary function tests (Spirometry)', 'Chest X-ray', 'CT scan', 'Arterial blood gas analysis'],
treatment: {
medications: ['Bronchodilators', 'Inhaled steroids', 'Combination inhalers'],
procedures: ['Oxygen therapy', 'Pulmonary rehabilitation', 'Lung transplant'],
lifestyle: ['Avoid smoke', 'Regular exercise', 'Eat healthy']
},
preparation: ['Record daily SOB levels', 'Note mucus color/consistency', 'List smoking history']
},
{
id: 'depression',
name: 'Depression',
aliases: ['Major Depressive Disorder', 'Clinical Depression'],
overview: 'Depression is a mood disorder that causes a persistent feeling of sadness and loss of interest. It affects how you feel, think and behave and can lead to a variety of emotional and physical problems.',
symptoms: ['Feelings of sadness/hopelessness', 'Angry outbursts', 'Loss of interest in hobbies', 'Sleep disturbances', 'Tiredness'],
emergencySigns: ['Thoughts of self-harm', 'Suicidal ideation', 'Inability to perform basic hygiene', 'Severe withdrawal'],
causes: 'Biological chemistry, hormones, inherited traits, and early childhood trauma.',
riskFactors: ['Low self-esteem', 'Traumatic events', 'Blood relatives with depression', 'Other mental health disorders'],
complications: ['Excess weight/Obesity', 'Physical illness', 'Substance misuse', 'Social isolation'],
prevention: ['Manage stress', 'Reach out for support in crises', 'Get treatment at the first sign of a problem'],
diagnosis: ['Physical exam', 'Lab tests', 'Psychiatric evaluation', 'DSM-5 criteria'],
treatment: {
medications: ['SSRIs', 'SNRIs', 'Atypical antidepressants'],
procedures: ['Psychotherapy', 'Electroconvulsive therapy (ECT)', 'TMS'],
lifestyle: ['Simplify life', 'Write in a journal', 'Don\'t isolate yourself']
},
preparation: ['Note mood patterns', 'List major life changes', 'Prepare to talk about family history']
},
{
id: 'anxiety',
name: 'Anxiety Disorders',
aliases: ['GAD', 'Panic Disorder', 'Social Anxiety'],
overview: 'Anxiety disorders involve more than temporary worry or fear. For a person with an anxiety disorder, the anxiety does not go away and can get worse over time.',
symptoms: ['Feeling nervous/restless', 'Sense of impending doom', 'Increased heart rate', 'Rapid breathing', 'Trembling'],
emergencySigns: ['Panic attacks (chest pain, shortness of breath)', 'Inability to function at work/home', 'Self-harm thoughts'],
causes: 'Genetics, brain biology/chemistry, and environmental stress.',
riskFactors: ['Trauma', 'Stress due to illness', 'Personality type', 'Drugs or alcohol'],
complications: ['Depression', 'Substance misuse', 'Insomnia', 'Digestive/Bowel problems'],
prevention: ['Get help early', 'Keep active', 'Avoid alcohol or drug use'],
diagnosis: ['Psychological evaluation', 'Comparison to DSM-5 criteria'],
treatment: {
medications: ['Anti-anxiety meds', 'Antidepressants', 'Beta blockers'],
procedures: ['Cognitive Behavioral Therapy (CBT)', 'Exposure therapy'],
lifestyle: ['Keep a journal', 'Prioritize sleep', 'Eat healthy']
},
preparation: ['Note what triggers anxiety', 'Record physical symptoms during attacks', 'List stressors']
},
{
id: 'stroke',
name: 'Stroke',
aliases: ['Cerebrovascular Accident', 'CVA', 'Brain Attack'],
overview: 'A stroke occurs when the blood supply to part of your brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients. Brain cells begin to die in minutes.',
symptoms: ['Trouble speaking', 'Paralysis/numbness of face, arm, leg', 'Trouble seeing', 'Headache', 'Trouble walking'],
emergencySigns: ['F.A.S.T (Face drooping, Arm weakness, Speech difficulty, Time to call 911)'],
causes: 'Ischemic (blocked artery) or Hemorrhagic (leaking/bursting blood vessel).',
riskFactors: ['High blood pressure', 'Smoking', 'High cholesterol', 'Diabetes', 'Obesity', 'Cardiovascular disease'],
complications: ['Paralysis', 'Loss of muscle movement', 'Difficulty talking/swallowing', 'Memory loss', 'Emotional problems'],
prevention: ['Control high BP', 'Lower cholesterol', 'Quit tobacco', 'Manage diabetes', 'Healthy weight'],
diagnosis: ['Physical exam', 'CT scan', 'MRI', 'Carotid ultrasound', 'Echocardiogram'],
treatment: {
medications: ['tPA (clot buster)', 'Blood thinners', 'Statins'],
procedures: ['Emergency endovascular procedures', 'Carotid endarterectomy'],
lifestyle: ['Physical therapy', 'Occupational therapy', 'Speech therapy']
},
preparation: ['KNOW THE TIME SYMPTOMS STARTED', 'List all medications', 'Note any prior "mini-strokes" (TIA)']
},
{
id: 'anemia',
name: 'Anemia',
aliases: ['Iron Deficiency Anemia', 'Low Blood'],
overview: 'Anemia is a condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body\'s tissues.',
symptoms: ['Fatigue', 'Weakness', 'Pale/yellowish skin', 'Irregular heartbeats', 'Dizziness', 'Cold hands/feet'],
emergencySigns: ['Severe shortness of breath', 'Chest pain', 'Fainting'],
causes: 'Iron deficiency, vitamin deficiency, inflammation, or aplastic anemia.',
riskFactors: ['A diet lacking certain vitamins', 'Intestinal disorders', 'Menstruation', 'Pregnancy', 'Chronic conditions'],
complications: ['Severe fatigue', 'Pregnancy complications', 'Heart problems', 'Death (in rare inherited cases)'],
prevention: ['Eat iron-rich foods', 'Consume Vitamin C (aids iron absorption)', 'Multivitamins if recommended'],
diagnosis: ['Complete Blood Count (CBC)', 'Test to determine size/shape of RBCs'],
treatment: {
medications: ['Iron supplements', 'Vitamin B-12 injections', 'Erythropoietin'],
procedures: ['Blood transfusion', 'Bone marrow transplant'],
lifestyle: ['Nutritious diet', 'Hydration']
},
preparation: ['Note diet habits', 'List energy level patterns', 'Record any heavy bleeding']
},
{
id: 'osteoarthritis',
name: 'Osteoarthritis',
aliases: ['OA', 'Wear-and-tear arthritis', 'Degenerative joint disease'],
overview: 'Osteoarthritis is the most common form of arthritis, affecting millions of people worldwide. It occurs when the protective cartilage that cushions the ends of your bones wears down over time.',
symptoms: ['Pain in joints', 'Stiffness (especially in morning)', 'Tenderness', 'Loss of flexibility', 'Grating sensation'],
emergencySigns: ['Inability to bear weight on a joint', 'Sudden severe swelling', 'Joint redness and fever'],
causes: 'Gradual deterioration of cartilage. It\'s not just wear and tear; it\'s an active process of the joint tissue.',
riskFactors: ['Older age', 'Sex (women more likely)', 'Obesity', 'Joint injuries', 'Repeated stress on joint'],
complications: ['Chronic pain', 'Disability', 'Difficulty with daily tasks', 'Sleep interference'],
prevention: ['Maintain healthy weight', 'Stay active', 'Prevent joint injuries', 'Control blood sugar'],
diagnosis: ['Physical exam', 'X-rays', 'MRI', 'Lab tests (joint fluid analysis)'],
treatment: {
medications: ['Acetaminophen', 'NSAIDs', 'Duloxetine'],
procedures: ['Cortisone injections', 'Lubrication injections', 'Joint replacement'],
lifestyle: ['Low-impact exercise', 'Weight loss', 'Tai chi/Yoga']
},
preparation: ['Note which joints hurt most', 'Record when stiffness is worst', 'List activities you can no longer do']
},
{
id: 'influenza',
name: 'Influenza (Flu)',
aliases: ['The Flu', 'Seasonal Flu'],
overview: 'The flu is a viral infection that attacks your respiratory system. Unlike a cold, the flu comes on suddenly.',
symptoms: ['Fever', 'Aching muscles', 'Chills/Sweats', 'Dry cough', 'Fatigue', 'Congestion'],
emergencySigns: ['Difficulty breathing', 'Chest pain', 'Seizures', 'Severe weakness'],
causes: 'Influenza viruses that spread through droplets.',
riskFactors: ['Young children', 'Adults >65', 'Weakened immune system', 'Pregnancy'],
complications: ['Pneumonia', 'Bronchitis', 'Heart inflammation'],
prevention: ['Annual flu vaccine', 'Hand washing', 'Avoid crowds'],
diagnosis: ['Rapid flu test', 'Molecular assays'],
treatment: {
medications: ['Antivirals (Tamiflu)'],
procedures: [],
lifestyle: ['Rest', 'Hydration', 'Stay home']
},
preparation: ['Note onset time', 'Record highest fever', 'List chronic conditions']
},
{
id: 'migraine',
name: 'Migraine',
aliases: ['Migraine Headache'],
overview: 'A migraine is a headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head.',
symptoms: ['Throbbing pain', 'Nausea', 'Sensitivity to light/sound', 'Visual aura'],
emergencySigns: ['Thunderclap headache', 'Fever/Stiff neck with headache', 'Weakness'],
causes: 'Genetics and environmental factors. Brainstem/trigeminal nerve interaction.',
riskFactors: ['Family history', 'Age', 'Hormonal changes'],
complications: ['Status migrainosus', 'Migrainous infarction'],
prevention: ['Stress management', 'Regular sleep', 'Avoiding triggers (MSG, aged cheese)'],
diagnosis: ['Neurological exam', 'MRI'],
treatment: {
medications: ['Triptans', 'NSAIDS', 'Botox'],
procedures: [],
lifestyle: ['Dark room rest', 'Regular exercise']
},
preparation: ['Headache diary', 'List triggers', 'Note frequency']
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

      {/* Print-only title */}
      <div className="hidden print:flex items-center gap-2 mb-2 border-b-2 border-slate-200 pb-1 mt-4">
        <Icon size={18} className={colorClass} />
        <h3 className={`text-md font-bold uppercase tracking-wide ${colorClass}`}>{title}</h3>
      </div>

      {(isOpen || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
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

const filteredDiseases = useMemo(() => {
if (!searchQuery) return DISEASE_DATABASE;
return DISEASE_DATABASE.filter(d =>
d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
d.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
);
}, [searchQuery]);

const handleSelect = (disease) => {
setSelectedDisease(disease);
setShowSearch(false);
window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleBack = () => {
setSelectedDisease(null);
setShowSearch(true);
};

const handlePrint = () => {
window.print();
};

return (
<div className="min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white print:text-black">
{/_ Header _/}
<header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm print:hidden">
<div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
<div className="bg-blue-600 p-2 rounded-lg text-white">
<Activity size={24} />
</div>
<h1 className="text-xl font-bold tracking-tight text-slate-800">HealthLens</h1>
</div>
{!showSearch && (
<button 
            onClick={handleBack}
            className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
          >
<X size={24} />
</button>
)}
</header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 print:p-0 print:max-w-full">
        {showSearch ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Disease Library</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg md:text-xl">
                Verified educational information for patients and caregivers.
              </p>
            </div>

            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search condition or symptom (e.g. Heart, Migraine)..."
                className="block w-full pl-14 pr-4 py-5 border-2 border-slate-200 rounded-3xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiseases.map(disease => (
                <button
                  key={disease.id}
                  onClick={() => handleSelect(disease)}
                  className="flex flex-col p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">{disease.name}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed flex-grow">
                    {disease.overview}
                  </p>
                  <div className="mt-4 flex items-center text-blue-500 text-xs font-bold uppercase tracking-wider">
                    Learn More <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Print Only Guide Header */}
            <div className="hidden print:block mb-8 border-b-4 border-blue-600 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase">Patient Education Guide</h1>
                  <p className="text-slate-600 font-medium">Verified health insights for awareness and education.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">HealthLens Module</p>
                  <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Disclaimer Bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4 print:bg-white print:border-slate-300 print:text-black print:rounded-none">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5 print:text-black" size={24} />
              <div className="text-sm text-amber-900 leading-relaxed print:text-black">
                <span className="font-bold">Important Medical Information:</span> This guide is for educational use only. It does not provide medical diagnosis or treatment advice. Consult a healthcare professional before making health decisions.
              </div>
            </div>

            {/* Title & Aliases */}
            <div className="mb-10 print:mb-6">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 print:text-3xl">{selectedDisease.name}</h2>
              <div className="flex flex-wrap gap-2 print:hidden">
                {selectedDisease.aliases.map(alias => (
                  <span key={alias} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full uppercase tracking-widest">
                    {alias}
                  </span>
                ))}
              </div>
              <p className="hidden print:block text-sm font-bold text-slate-500 mb-6 italic">
                Terminology: {selectedDisease.aliases.join(' • ')}
              </p>
            </div>

            {/* Sections */}
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

              <Section title="When to see a doctor" icon={AlertTriangle} colorClass="text-red-600">
                <p className="mb-3 font-bold text-red-700 print:text-black text-sm">EMERGENCY SIGNS:</p>
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
              <div className="space-y-6">
                <div className="print:mt-2">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-100 print:border-none">Common Medications</h4>
                  <p className="text-sm leading-relaxed">{selectedDisease.treatment.medications.join(', ') || 'Varies by severity'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-100 print:border-none">Lifestyle Management</h4>
                  <p className="text-sm leading-relaxed">{selectedDisease.treatment.lifestyle.join(', ')}</p>
                </div>
                {selectedDisease.diagnosis && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2 border-b border-slate-100 print:border-none">Diagnostic Procedures</h4>
                    <p className="text-sm leading-relaxed">{selectedDisease.diagnosis.join(', ')}</p>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Preparing for Appointment" icon={Calendar} colorClass="text-amber-600">
              <div className="grid grid-cols-1 gap-3 print:block">
                {selectedDisease.preparation.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl print:border-none print:p-0 print:mb-1">
                    <span className="text-xl font-black text-amber-200 print:text-black">0{idx + 1}</span>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Print Help Message */}
            {!showSearch && (
              <p className="text-center text-xs text-slate-400 mt-10 print:hidden italic">
                Tip: Click Generate Patient Guide, then select "Save as PDF" to download this information.
              </p>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pb-20 print:hidden">
              <button
                onClick={handleBack}
                className="flex-1 px-8 py-5 bg-white border-2 border-slate-200 text-slate-800 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Back to Library
              </button>
              <button
                className="flex-1 px-8 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                onClick={handlePrint}
              >
                <Printer size={20} />
                Generate Patient Guide (PDF)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-12 px-6 mt-10 print:mt-10 print:bg-white print:border-t-2 print:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed print:text-black print:text-[8px]">
            © 2025 HealthLens Module. This tool is for general awareness. Information is subject to change.
            NOT A SUBSTITUTE FOR MEDICAL ADVICE. If you are experiencing a medical emergency, contact emergency services immediately.
          </p>
        </div>
      </footer>
    </div>

);
}
