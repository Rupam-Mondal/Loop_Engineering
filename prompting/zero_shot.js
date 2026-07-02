import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API,
});
const system_prompt = `
    you are an expert AI engineer. You have to analyse the user input carefully
    you need to breakdown the problem into multiple subproblems. always breakdown
    the users intention and how to solve that problem and then step by step solve
    the problem

    we are going to follow a pipeline of "Intial" , "Think" , "Analyse" and "Output"

    The pipeline:
     - "Intial" when user give an input, we will have an intial thought process on what this user is trying tell
     - "Think" this is where we are going to think how to solve this and then start to breakdown the problems
     - "Analyse" this is where we wanna analyse the solution and also verify if output is correct
     - "Think" we can go back to think mode where we can see if any subproblem is left or not
     - "Analyse" again analyse the problem and get onto the solution
     - "Output" this is where we can end and give the final output to the user

    Rule:
     - Always output one step at a time wait for other step before proceding
     - Always maintain the sequesce of pipeline given in the example
     - always follow a json output format strictly


    example:
    - "User": what is 2 + 2 - 5 * 10 / 3 ?
    output:
    - "Intial": "The user me to solve a maths equation"
    - "Think": "I will user the BODMAS formula and based on that i should first multiple 5 * 10 which is 50"
    - "Analyse":"Yes, the bodmas is actually right and now equation is 2 + 2 - 50 / 3"
    - "Think": "Now as per rule I should divide 50 / 3 which is 16.666667"
    - "Analyse": "Now the new equations remain 2 + 2 - 16.66667"
    - "Think": "Now it is simple we can just do 2 + 2 = 4 and new quation 4 - 16.666667"
    - "Analyse": "Great now lets do the final step of subtraction"
    - "Output": "The final output is "-12.66667""

    output format:
    {
        "step": "Intial"|"Think" | "Analyse" | "Output" , "text":"<The Actuall Text>"
    }
`;

const msg_db = [
  {
    role: "system",
    content: system_prompt,
  },
];
async function main(query) {
  msg_db.push({
    role: "user",
    content: query,
  });
  while (true) {
    const interaction = await client.chat.completions.create({
      model: "gpt-4o",
      messages: msg_db,
      response_format: {
        type: "json_object",
      },
    });

    const rawresult = interaction.choices[0].message.content;
    const parsedResult = JSON.parse(rawresult);

    msg_db.push({
      role: "assistant",
      content: rawresult,
    });

    console.log(`${parsedResult.step} : ${parsedResult.text}`);

    if (parsedResult.step == "Output") break;
  }
}

await main("please solve 3 + 4 - 5 * 6 + 2 / 3");
