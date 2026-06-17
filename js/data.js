export const APP_TITLE = "Briefsmith";
export const APP_TAGLINE = "Forge better briefs. Build better software.";

export const STEPS = [
  {
    id: 1,
    label: "Identity",
    fields: [
      {
        key: "name",
        label: "Project name",
        hint: "A short, specific name sets the AI's mental model before it reads anything else. Concrete names like 'BudgetTracker' or 'RecipeVault' produce better-named files and functions than 'MyApp' or 'Project1'.",
        placeholder: "RecipeVault",
        multiline: false,
        monospace: false
      },
      {
        key: "description",
        label: "One-line summary",
        hint: "One sentence. Lead with a verb. Describe what the app does and who it's for. This single sentence calibrates every naming and architecture decision the AI makes for the entire project.",
        placeholder: "A web app where home cooks save, tag, and search their personal recipe collection.",
        multiline: false,
        monospace: false
      },
      {
        key: "stack",
        label: "Tech stack",
        hint: "List every technology you want used — and explicitly name anything you do NOT want. If you leave this blank, the AI picks the most fashionable option, not the simplest one for your level.",
        placeholder: "Vanilla JavaScript, HTML, CSS. No frameworks. Node.js + Express for the server. SQLite for the database. No TypeScript. No build step.",
        multiline: false,
        monospace: false
      }
    ],
    tip: "The project name and description are the AI's anchor point. Every file it creates, every function it names, and every comment it writes gets calibrated against this description. A vague description like 'a recipe app' produces generic output you'll spend an hour renaming. A specific description like 'a web app where home cooks save and search recipes' produces code whose structure already matches your mental model — folder names, variable names, and function names all reflect what you actually built.",
    callouts: [
      {
        type: "warning",
        text: "If you skip the stack field, the AI will choose for you — often picking Next.js when you wanted plain HTML, or TypeScript when you're not ready for it. The stack section is where you protect yourself from a codebase you can't maintain."
      },
      {
        type: "good",
        text: "Saying 'No frameworks' or 'No TypeScript' is just as powerful as saying what you DO want. Explicit exclusions prevent entire categories of unwanted output before the AI writes a single line."
      }
    ]
  },
  {
    id: 2,
    label: "Behavior",
    fields: [
      {
        key: "behavior",
        label: "What the app does",
        hint: "Describe the core actions a user can take. Think in verbs: add, save, search, filter, edit, delete, display. Each verb you write becomes a feature. Each verb you skip may be guessed, left out, or invented incorrectly.",
        placeholder: "Users can add a recipe with a title, ingredient list, and step-by-step instructions. They can tag recipes with custom labels like 'vegetarian' or 'quick meals'. They can search recipes by title or tag. They can view a recipe detail page. They can edit or delete any recipe. All data persists in a local SQLite database between sessions.",
        multiline: true,
        monospace: false
      },
      {
        key: "outOfScope",
        label: "What it does NOT do",
        hint: "List features you explicitly don't want built. This is not pessimism — it's precision. Without this list, the AI fills every implied gap with its best guess. That guess often adds auth systems, mobile views, and cloud sync you never asked for.",
        placeholder: "No user accounts or login.\nNo image uploads or photo attachments.\nNo sharing, exporting, or printing.\nNo mobile app — desktop web browser only.\nNo real-time sync or cloud storage.\nNo recipe import from external URLs.",
        multiline: true,
        monospace: false
      }
    ],
    tip: "Behavior is where most beginner prompts fall apart. 'A recipe app' could describe ten completely different codebases. The AI needs to know not just what the app IS, but what actions it performs and in what sequence. Think of each sentence as a feature ticket. If a feature is not written here, do not expect it to exist in the output — or worse, expect the AI to invent its own version of it that doesn't match your vision.",
    callouts: [
      {
        type: "warning",
        text: "Skipping the out-of-scope section is one of the most common beginner mistakes. Without it, the AI may add user authentication, cloud sync, a REST API, or a mobile-responsive PWA that you never asked for — and didn't want to debug."
      },
      {
        type: "good",
        text: "Each line in the 'does not do' list is a guard rail installed before a single line of code is written. Scope creep is ten times easier to prevent than to undo."
      }
    ]
  },
  {
    id: 3,
    label: "Structure",
    fields: [
      {
        key: "fileStructure",
        label: "File and folder structure",
        hint: "Sketch the folder layout and key files. You don't need every file — just enough to show the shape of the project. This prevents the AI from inventing its own structure that you'll have to reorganize on day one.",
        placeholder: "recipevault/\n├── index.html\n├── server.js\n├── package.json\n├── db/\n│   └── schema.sql\n├── routes/\n│   ├── recipes.js\n│   └── tags.js\n├── public/\n│   ├── css/\n│   │   └── style.css\n│   └── js/\n│       └── app.js\n└── README.md",
        multiline: true,
        monospace: true
      },
      {
        key: "dataModel",
        label: "Data model",
        hint: "List the key 'things' your app tracks and their important fields. Plain English is fine — you don't need SQL syntax. A 'data model' just means: what objects does the app remember, and what do we know about each one?",
        placeholder: "Recipe: id, title (text), ingredients (text), instructions (text), created_at (timestamp)\nTag: id, name (text, unique)\nRecipeTag: recipe_id, tag_id  — join table linking recipes to tags\n\nOne recipe can have many tags. One tag can belong to many recipes.",
        multiline: true,
        monospace: true
      }
    ],
    tip: "Structure is the section most beginners skip because it feels like extra work before any code exists. But when the AI invents its own file structure, you spend your first hour reorganizing instead of building. A 10-line sketch saves 60 minutes of cleanup. The data model matters even more: it locks in your database schema before the AI writes any queries. Schema changes cascade — every route, every query, every frontend call may need updating. Getting it right upfront is ten times cheaper than fixing it later.",
    callouts: [
      {
        type: "warning",
        text: "If you skip the data model, the AI may store everything in a single JSON blob, use field names that conflict with SQL reserved words, or design a schema you can't extend when your requirements change."
      },
      {
        type: "good",
        text: "You don't need a perfect file structure — just the major folders. Even a rough sketch like 'routes/, public/, db/' gives the AI clear organizational intent that shapes every file it creates."
      }
    ]
  },
  {
    id: 4,
    label: "Constraints",
    fields: [
      {
        key: "constraints",
        label: "Hard technical constraints",
        hint: "Non-negotiable requirements from your environment, your skill level, or your deployment target. Be direct: 'must work in Node 18', 'no external APIs', 'no build step'. The AI wants to write impressive code — this is where you rein it in to what you can actually run.",
        placeholder: "Must run on Node.js 18 with no compilation or bundling step.\nMust work fully offline — no calls to external APIs or CDNs.\nAll dependencies must be installable via: npm install\nNo TypeScript. No JSX. Plain JavaScript only.\nApp starts with a single command: node server.js\nNo environment variables required for basic operation.",
        multiline: true,
        monospace: false
      },
      {
        key: "errorHandling",
        label: "Error handling",
        hint: "Describe how you want errors surfaced. If the database fails, should the server crash loudly or recover? Should errors appear in the browser or log to the terminal? Spelling this out prevents silent failures that are impossible to debug.",
        placeholder: "If a database write fails, show an inline error message in the UI — do not crash the server.\nAll server errors log to console with the full stack trace.\nIf a recipe is not found, return a 404 JSON response: { error: 'Recipe not found' }\nClient-side fetch errors display in a visible #error-message div — never use alert().\nDo not swallow errors silently with empty catch blocks.",
        multiline: true,
        monospace: false
      }
    ],
    tip: "Constraints are where you enforce your own knowledge boundaries and protect yourself from the AI's enthusiasm. The AI naturally reaches for the most powerful, modern tool for each job. That tool is often not the simplest one you can run, debug, and maintain. If you don't know TypeScript, say so explicitly — otherwise you'll get a codebase you can't read. Constraints are professional, not defensive. Every experienced engineer knows exactly what their project can and cannot afford to take on.",
    callouts: [
      {
        type: "warning",
        text: "Leaving error handling unspecified often results in empty catch blocks that swallow failures silently. Your app will appear to work in development and fail invisibly when real users touch it."
      },
      {
        type: "good",
        text: "Constraints protect you from your own blind spots as much as from the AI. Writing 'no TypeScript' forces you to acknowledge what stack you can actually support — and that clarity is valuable before you prompt anything."
      }
    ]
  },
  {
    id: 5,
    label: "Build Order",
    fields: [
      {
        key: "buildOrder",
        label: "Build order",
        hint: "Number the steps you want the AI to follow. Start with the data layer, then the server, then the frontend, then polish. This turns a one-shot code dump into a reviewable conversation — you can test step 1 before step 2 begins.",
        placeholder: "1. Create the SQLite schema: Recipe, Tag, and RecipeTag tables with correct columns and relationships\n2. Build the Express server with core routes: GET /api/recipes, POST /api/recipes, DELETE /api/recipes/:id\n3. Create the HTML shell: recipe list view and add-recipe form, no styling yet\n4. Wire frontend JavaScript to call the API and render the recipe list dynamically\n5. Add tag creation, tag assignment to recipes, and filter-by-tag\n6. Add edit recipe functionality with a pre-filled form\n7. Apply final CSS: minimal, readable, desktop-only",
        multiline: true,
        monospace: false
      }
    ],
    tip: "Build order transforms a one-shot code dump into a conversation you can steer. When you tell the AI to build step 1 first, you can test that the database works before the server is written. This is how professionals build software — foundation first, features second, polish last. It also makes the AI's output reviewable in chunks: three files at a time instead of twenty at once. You catch mistakes at the layer where they're cheapest to fix, not after everything above them has been built on top.",
    callouts: [
      {
        type: "warning",
        text: "Without a build order, the AI scaffolds everything in one pass — schema, routes, frontend, and CSS all at once. When something breaks, you won't know which layer failed, and changes in one layer will conflict with the others."
      },
      {
        type: "good",
        text: "A numbered build order is the single highest-leverage change a beginner can make to their prompting habit. It turns AI-assisted development from a guessing game into an incremental, testable process you actually control."
      }
    ]
  }
];
