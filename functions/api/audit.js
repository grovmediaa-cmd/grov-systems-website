const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json;charset=UTF-8" }
});

const money = n => "AED " + Math.round(Number(n) || 0).toLocaleString("en-US");

function calculate(a) {
  const e = Number(a.enquiries);
  const q = e * Number(a.qualified) / 100;
  const v = q * Number(a.viewing) / 100;
  const o = v * Number(a.offer) / 100;
  const t = o * Number(a.transaction) / 100;
  const annual = t * Number(a.commission) * 12;

  const stages = [
    ["qualified","Enquiry → Qualified Conversation",4,Number(a.qualified)],
    ["viewing","Qualified → Viewing",10,Number(a.viewing)],
    ["offer","Property viewing → Offer",8,Number(a.offer)],
    ["transaction","Offer → Completed transaction",7,Number(a.transaction)]
  ];

  const opportunities = stages.map(function(s) {
    const key=s[0], label=s[1], delta=s[2], current=s[3];
    const rates=[Number(a.qualified),Number(a.viewing),Number(a.offer),Number(a.transaction)];
    const idx=["qualified","viewing","offer","transaction"].indexOf(key);
    rates[idx]=Math.min(100,rates[idx]+delta);
    const improved=e*rates.reduce(function(x,r){return x*(Math.max(0,Math.min(100,r))/100)},1);
    return {key:key,label:label,current:current,scenario:Math.min(100,current+delta),annualOpportunity:Math.max(0,(improved-t)*Number(a.commission)*12)};
  }).sort(function(x,y){return y.annualOpportunity-x.annualOpportunity});

  return {q:q,v:v,o:o,t:t,annual:annual,opportunities:opportunities,primary:opportunities[0]};
}

function stageInsight(a,c) {
  const p=c.primary;
  const e=Math.round(Number(a.enquiries)).toLocaleString();
  if(p.key==="qualified") return "You’re receiving around "+e+" new enquiries a month, but only "+p.current+"% are currently becoming serious / qualified prospects. That makes the first question less about generating more enquiries and more about what happens in the first few minutes after one arrives.";
  if(p.key==="viewing") return "Your answers suggest the bigger conversion gap is after a prospect is already qualified. You’re converting "+p.current+"% of serious / qualified prospects into property viewings, so the opportunity is in moving intent into a scheduled next step.";
  if(p.key==="offer") return "Your funnel is getting prospects as far as property viewings, but only "+p.current+"% of those viewings are currently becoming offers. That points to the post-viewing experience, follow-up and next-action process as the place worth examining.";
  return "Your biggest modeled gap is after an offer is made: "+p.current+"% of offers currently become completed transactions. At that stage, the value is less about sending more generic follow-ups and more about making sure every active deal has the right next action at the right time.";
}

function automationAngle(a,c) {
  const p=c.primary;
  if(p.key==="qualified") return "I’d look first at instant enquiry response, qualification, routing and the follow-up that happens when a new lead goes quiet.";
  if(p.key==="viewing") return "I’d look first at qualification-to-viewing workflows, property matching, booking and the WhatsApp follow-up around an intended viewing.";
  if(p.key==="offer") return "I’d look first at post-viewing follow-up, feedback capture, objection handling and making the next property or next conversation obvious.";
  return "I’d look first at offer-stage follow-up, deal activity alerts, next-action tracking and keeping agents focused on the opportunities that need human attention.";
}

function responseAngle(a) {
  const slow=["30–60 minutes","1–4 hours","Same day","Next day or later","Not sure"].includes(a.response);
  if(slow) return "You also told us your team typically responds in "+a.response.toLowerCase()+". I wouldn’t assume every lead needs a human response immediately, but there is a clear opportunity to automate the first useful interaction while keeping the agent involved when the lead is ready.";
  return "You told us your team responds in "+a.response.toLowerCase()+", so I wouldn’t make “faster response” the whole strategy. The more interesting question is what happens after that first response.";
}

function followupAngle(a) {
  if(["0–1","2–3","Not sure"].includes(a.followups)) return "Your typical follow-up is "+a.followups+". That is worth testing because many prospects will not move forward on the first conversation, and the follow-up should change with the stage rather than becoming a generic sequence.";
  return "You’re already doing "+a.followups+" follow-ups in a typical process. I’d focus less on adding more touches and more on whether each touch is triggered by the prospect’s actual stage and behaviour.";
}

function buildEmails(a,c) {
  const p=c.primary, first=a.firstName||"there", company=a.company||"your brokerage", opp=money(p.annualOpportunity);
  const auditUrl="https://grovsystems.com/real-estate-revenue-audit/";
  const bookingUrl="https://gm.grovmedia.com/widget/bookings/grov-automation-breakdown";
  const leakQuestion="Do you know where your brokerage is leaking the most revenue after an enquiry comes in?";
  const funnel="Enquiry → Qualified → Viewing → Offer → Transaction";

  const e1={
    subject:"Where is "+company+" leaking revenue?",
    body:"Hi "+first+",\n\nQuick question: "+leakQuestion+"\n\nThe path is usually simple on paper:\n\n"+funnel+"\n\nBut a brokerage can generate plenty of enquiries and still have a meaningful revenue leak between those stages.\n\nWe built a 2-minute Real Estate Revenue Leak Audit that uses your actual numbers to identify the stage with the largest modeled revenue opportunity.\n\nNo CRM access required.\n\nRun it here:\n"+auditUrl+"\n\n— Mokshita\nGrov Systems"
  };

  const e2={
    subject:"Your biggest revenue leak may not be at the top of the funnel",
    body:"Hi "+first+",\n\nA quick follow-up on the Revenue Leak Audit.\n\nThe useful question isn't simply “how many leads are you generating?”\n\nIt's:\n\nWhere do enquiries stop moving consistently from one stage to the next?\n\n"+funnel+"\n\nA small conversion change at one stage can carry through the rest of the funnel. The audit lets you put in your actual numbers and see which stage has the largest modeled financial impact.\n\nIf you haven't run it yet:\n"+auditUrl+"\n\nIt takes about 2 minutes.\n\n— Mokshita\nGrov Systems"
  };

  const e3={
    subject:"What happens after an enquiry arrives at "+company+"?",
    body:"Hi "+first+",\n\nOne thing I'd look at before recommending more lead generation for "+company+": what happens immediately after an enquiry arrives?\n\nHow quickly is it answered?\nHow is it qualified?\nHow many times is it followed up?\nAnd what moves it to the next stage?\n\nThose handoffs are often where the sales process becomes inconsistent.\n\nThe Real Estate Revenue Leak Audit gives you a simple way to see which stage deserves attention first using your own numbers.\n\nRun it here:\n"+auditUrl+"\n\n— Mokshita\nGrov Systems"
  };

  const e4={
    subject:"I found the question I'd ask about "+company+"'s sales process",
    body:"Hi "+first+",\n\nIf I were mapping "+company+"'s sales process, I'd start with one question:\n\n“Where are enquiries dropping out before they become transactions?”\n\nThen I'd map:\n\nEnquiry → Qualification → Viewing → Offer → Transaction\n\nThe point isn't to assume there is a problem. It's to quantify where the biggest modeled opportunity appears before deciding what, if anything, should be changed.\n\nThat's what the Revenue Leak Audit is built to do.\n\nYou can run it here:\n"+auditUrl+"\n\nNo CRM access required.\n\n— Mokshita\nGrov Systems"
  };

  const e5={
    subject:"Should I close the loop on your Revenue Leak Audit?",
    body:"Hi "+first+",\n\nClosing the loop on this.\n\nIf you're curious where "+company+"'s biggest modeled revenue leak appears, the audit takes about 2 minutes and uses your own funnel numbers.\n\n"+funnel+"\n\nYou'll see:\n• the current funnel implied by your numbers\n• the stage with the largest modeled revenue opportunity\n• the illustrative annual commission impact\n• and what we'd investigate first\n\nRun it here:\n"+auditUrl+"\n\nIf the numbers point to a meaningful opportunity, the next step is the Automation Breakdown — where we'd map that stage to your CRM, WhatsApp and sales workflow.\n\n— Mokshita\nGrov Systems"
  };

  return [e1,e2,e3,e4,e5];
}


function buildReportEmail(a,c) {
  const p=c.primary, first=a.firstName||"there", company=a.company||"your brokerage";
  return [
    "Hi "+first+",",
    "",
    "Here is your Grov Real Estate Revenue Leak Audit for "+company+".",
    "",
    "YOUR BIGGEST MODELED REVENUE LEAK",
    p.label,
    "",
    "Current conversion: "+p.current+"%",
    "Illustrative scenario: "+p.scenario+"%",
    "Modeled annual opportunity: "+money(p.annualOpportunity),
    "",
    "CURRENT FUNNEL",
    "New enquiries: "+Math.round(Number(a.enquiries)).toLocaleString()+" / month",
    "Serious / qualified prospects: "+Math.round(c.q).toLocaleString()+" / month ("+a.qualified+"%)",
    "Property viewings: "+Math.round(c.v).toLocaleString()+" / month ("+a.viewing+"%)",
    "Offers: "+Math.round(c.o).toLocaleString()+" / month ("+a.offer+"%)",
    "Completed transactions: "+Math.round(c.t).toLocaleString()+" / month ("+a.transaction+"%)",
    "",
    "Current modeled annual commission: "+money(c.annual),
    "",
    "RESPONSE & FOLLOW-UP",
    "Typical response time: "+a.response,
    "Typical follow-up: "+a.followups,
    "",
    "WHAT WE'D INVESTIGATE FIRST",
    automationAngle(a,c),
    "",
    "This is an illustrative scenario based on the numbers you entered. It is not a guarantee or a claim that this amount is currently being lost.",
    "",
    "Map the opportunity: https://gm.grovmedia.com/widget/bookings/grov-automation-breakdown",
    "",
    "— Mokshita",
    "Grov Systems"
  ].join("\n");
}

export async function onRequestPost({request}) {
  try {
    const a=await request.json();
    if(!a.email||!a.company||!a.firstName) return json({ok:false,error:"Missing required audit identity fields."},400);
    const c=calculate(a), emails=buildEmails(a,c), auditId=crypto.randomUUID();

    const payload={
      event:a.report_requested ? "real_estate_revenue_leak_report_requested" : "real_estate_revenue_leak_audit_completed",
      audit_id:auditId,
      tag:"Dubai Real Estate Revenue Leak Audit Completed",
      first_name:a.firstName,email:a.email,company:a.company,role:a.role,
      enquiries:Number(a.enquiries),qualification_percent:Number(a.qualified),
      viewing_percent:Number(a.viewing),offer_percent:Number(a.offer),
      transaction_percent:Number(a.transaction),average_commission_aed:Number(a.commission),
      response_speed:a.response,follow_up_frequency:a.followups,
      monthly_transactions:c.t,current_annual_commission_aed:c.annual,
      primary_opportunity_stage:c.primary.label,
      primary_current_conversion:c.primary.current,
      primary_scenario_conversion:c.primary.scenario,
      primary_annual_opportunity_aed:c.primary.annualOpportunity,
      email_1_subject:emails[0].subject,email_1_body:emails[0].body,
      email_2_subject:emails[1].subject,email_2_body:emails[1].body,
      email_3_subject:emails[2].subject,email_3_body:emails[2].body,
      email_4_subject:emails[3].subject,email_4_body:emails[3].body,
      email_5_subject:emails[4].subject,email_5_body:emails[4].body,
      report_requested:Boolean(a.report_requested),
      report_email_subject:"Your Grov Real Estate Revenue Leak Audit — "+a.company,
      report_email_body:buildReportEmail(a,c),
      audit_url:"https://grovsystems.com/real-estate-revenue-audit/",
      booking_url:"https://gm.grovmedia.com/widget/bookings/grov-automation-breakdown"
    };

    const ghlWebhookUrl="https://services.leadconnectorhq.com/hooks/61oKsJYxy08f8yYuAF7i/webhook-trigger/5125d49f-a5ef-48a1-bddd-7a9c4ae53c5c";
    const r=await fetch(ghlWebhookUrl,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    return json({ok:true,audit_id:auditId,primary:c.primary,emails:emails,ghl:{sent:r.ok,status:r.status}});
  } catch(error) {
    return json({ok:false,error:"Unable to process audit."},500);
  }
}
