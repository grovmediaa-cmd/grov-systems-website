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

  const e1={
    subject:company+": the "+p.label.toLowerCase()+" opportunity in your audit",
    body:"Hi "+first+",\n\nI reviewed the numbers you entered for "+company+".\n\nThere’s one part of your funnel I’d look at before trying to generate more enquiries:\n\n"+p.label+".\n\nYour current conversion here is "+p.current+"%. In the scenario used for your audit, moving that to "+p.scenario+"% creates a modeled annual commission opportunity of "+opp+".\n\nThat number is not a promise — it’s a way of showing where a relatively small improvement could matter financially.\n\nWhat caught my attention is this:\n\n"+stageInsight(a,c)+"\n\n"+responseAngle(a)+"\n\n"+followupAngle(a)+"\n\n"+automationAngle(a,c)+"\n\nThat’s exactly what I’d want to map before recommending any automation — what should happen automatically, where an agent should take over, and what your CRM + WhatsApp workflow would need to look like.\n\nIf you want, book your Automation Breakdown here:\nhttps://gm.grovmedia.com/widget/bookings/grov-automation-breakdown\n\nWe’ll take the numbers from the audit and turn them into an actual workflow.\n\n— Mokshita\nGrov Systems"
  };

  const e2={
    subject:company+": I’d fix this stage before adding more leads",
    body:"Hi "+first+",\n\nOne thing from your audit has been sitting with me.\n\nYou’re already putting enquiries into the top of the funnel. The more interesting question is how many of those opportunities are being moved to the next stage consistently.\n\nYour biggest modeled opportunity was:\n\n"+p.label+" — "+p.current+"% today → "+p.scenario+"% in the audit scenario.\n\nThat is why I wouldn’t start by telling you to “get more leads.”\n\nI’d first make the existing sales process harder to drop.\n\nFor "+company+", I’d want to see:\n\n• what happens the moment an enquiry arrives\n• when qualification happens\n• what triggers the next follow-up\n• when an agent is notified\n• what happens when the prospect goes quiet\n• and where the process currently depends on someone remembering to do something manually\n\nThe goal isn’t to replace your agents.\n\nIt’s to remove the repetitive gaps around them so the agent spends more time on conversations that can actually move a deal.\n\nIf you want me to map that against your actual process, this is the next step:\nhttps://gm.grovmedia.com/widget/bookings/grov-automation-breakdown\n\n— Mokshita\nGrov Systems"
  };

  const e3={
    subject:"What I’d automate first at "+company,
    body:"Hi "+first+",\n\nIf "+company+" were sitting in front of me tomorrow, I would not start by automating everything.\n\nI’d start with the stage your audit flagged:\n\n"+p.label+".\n\nThen I’d build around three rules:\n\n1. Automate the repeatable part.\n2. Keep the decision-making part human.\n3. Make the next action impossible to miss.\n\nFor example, "+automationAngle(a,c)+"\n\nAnd because you told us your response time is "+a.response.toLowerCase()+" and typical follow-up is "+a.followups+", I’d design the workflow around those realities rather than dropping a generic “AI follow-up” system into the brokerage.\n\nThe point is a sales system that works with your agents — not one that creates more noise for them.\n\nIf you want to see exactly what that could look like for "+company+", book the Automation Breakdown:\nhttps://gm.grovmedia.com/widget/bookings/grov-automation-breakdown\n\nI’ll come prepared with the audit numbers you already submitted.\n\n— Mokshita\nGrov Systems"
  };

  const e4={
    subject:company+": what I’d want to map before building anything",
    body:"Hi "+first+",\n\nBefore building a single automation for "+company+", I’d want to map four things:\n\n1. Where enquiries enter the business.\n2. Where they are qualified.\n3. Where an agent takes over.\n4. What happens when the prospect doesn’t move forward immediately.\n\nYour audit gives us the first layer.\n\nThe Automation Breakdown is where we connect that to the actual operating system:\n\nCRM → WhatsApp → agent → follow-up → viewing / offer → next action.\n\nThat matters because the biggest opportunity in your audit isn’t necessarily solved by one automation.\n\nIt’s usually the handoffs between stages.\n\nA lead can be answered quickly and still be poorly qualified.\n\nA qualified buyer can still fail to book a viewing.\n\nA viewing can happen and still receive weak follow-up.\n\nAn offer can exist and still have no clear next action.\n\nThat’s the part I’d want to diagnose with you.\n\nIf you’d like to map it, choose a time here:\nhttps://gm.grovmedia.com/widget/bookings/grov-automation-breakdown\n\n— Mokshita\nGrov Systems"
  };

  const e5={
    subject:"Should I close the loop on your "+company+" audit?",
    body:"Hi "+first+",\n\nI wanted to close the loop on the Revenue Audit you completed for "+company+".\n\nYour numbers pointed most strongly toward:\n\n"+p.label+"\n\nThe audit modeled "+opp+" in additional annual commission if that stage improved from "+p.current+"% to "+p.scenario+"%.\n\nAgain, that’s a scenario — not a promise.\n\nThe useful part is knowing where I’d look first.\n\nIf improving that stage is already on your list, we can map the actual workflow and tell you what we’d automate, what should stay with your agents, and what the implementation would require.\n\nThat’s the Automation Breakdown:\nhttps://gm.grovmedia.com/widget/bookings/grov-automation-breakdown\n\nIf it isn’t a priority right now, no problem — I’ll close the loop here.\n\n— Mokshita\nGrov Systems"
  };

  return [e1,e2,e3,e4,e5];
}

export async function onRequestPost({request,env}) {
  try {
    const a=await request.json();
    if(!a.email||!a.company||!a.firstName) return json({ok:false,error:"Missing required audit identity fields."},400);
    const c=calculate(a), emails=buildEmails(a,c), auditId=crypto.randomUUID();

    const payload={
      event:"real_estate_revenue_audit_completed",
      audit_id:auditId,
      tag:"Dubai Real Estate Audit Completed",
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
      booking_url:"https://gm.grovmedia.com/widget/bookings/grov-automation-breakdown"
    };

    let ghl={sent:false};
    if(env.GHL_INBOUND_WEBHOOK_URL){
      const r=await fetch(env.GHL_INBOUND_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      ghl={sent:r.ok,status:r.status};
    }
    return json({ok:true,audit_id:auditId,primary:c.primary,emails:emails,ghl:ghl});
  } catch(error) {
    return json({ok:false,error:"Unable to process audit."},500);
  }
}
