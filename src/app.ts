enum ProjectStatus {
    active, finished
}


type Listener<T> = (intems: T[]) => void

class State<T> {
    protected listeners: Listener<T>[] = [] 
    
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

class Project {
    constructor(public id: string, 
                public title: string, 
                public description: string, 
                public people: number,
                public status: ProjectStatus) {}
}

// App state managment (Singleton)
class ProjectState extends State<Project> {
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {
        super()
    }

    static getInstance(): ProjectState{
        if(this.instance) {
            return this.instance
        }
        return new ProjectState()
    }
    
    addProject(title: string, description: string, numOfPeople: number) {
        const newProject  = new Project(
            Math.random().toString(), title, description, numOfPeople, ProjectStatus.active
        )
        this.projects.push(newProject)
        for(const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }

}

const projectState = ProjectState.getInstance()

// Validator
interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

function validate(validatableInput: Validatable): boolean {
    let isValid = true;
    if (validatableInput.required) {
      isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
      isValid =
        isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
      isValid =
        isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
      isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
      isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
  }

// Autobind decorator
function autobind(_: any, _1: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this)
        }
    }
    return adjDescriptor

}

// Component base class
abstract class Component < T extends HTMLElement, U extends HTMLElement > {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U

    constructor(templateId: string, hostElementId: string, atStart: boolean, newElementId ? : string) {
        this.templateElement = document.getElementById(templateId) !as HTMLTemplateElement
        this.hostElement = document.getElementById(hostElementId) !as T

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as U
        if (newElementId) {
            this.element.id = newElementId
        }
        this.attach(atStart)
    }

    private attach(atStart: boolean) {
        const where = atStart ? 'beforeend' : 'afterend'
        this.hostElement.insertAdjacentElement(where, this.element)
    }

    abstract configure(): void
    abstract renderContent(): void
}


// Model
class ProjectList extends Component < HTMLDivElement, HTMLElement > {
    assignedProjects: Project[]

    constructor(private type: 'active' | 'finished') {
        
        super('project-list', 'app', false, `${type}-projects`)

        this.assignedProjects = []
        this.configure()
        this.renderContent()
    }

    private renderProjects(): void {
        const listId = `${this.type}-project-list`
        const listEl = document.getElementById(listId) !as HTMLUListElement
        // Clean items
        listEl.innerHTML = ''

        for (const item of this.assignedProjects) {
            const listItem = document.createElement('li')
            listItem.textContent = item.title
            listEl.appendChild(listItem)
        }
    }

    renderContent() {
        // <ul>
        const listId = `${this.type}-project-list`
        this.element.querySelector('ul') !.id = listId

        // <h2>
        this.element.querySelector('h2') !.textContent = this.type.toUpperCase().concat(' PROJECTS')
    }

    configure() {
        projectState?.addListener((projects: Project[]) => {
            const filteredProject = projects.filter(p => {
                if (this.type === 'active') {
                    return p.status === ProjectStatus.active
                }
                return p.status === ProjectStatus.finished
            })
            this.assignedProjects = filteredProject
            this.renderProjects()
        })
    }
}


class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {

    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {

        super('project-input', 'app', true, 'user-input')

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement
        this.configure()
    }

    configure() {
        this.element.addEventListener(
            'submit',
            this.submitHandler 
            //this.submitHandler.bind(this) // need to reference this (object) in submitHandler
        )
    }

    renderContent(){}

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault()
        console.log("Submited...")
        const userInput = this.garherUserInput()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput
            console.log(title, desc, people)
            projectState?.addProject(title, desc, people)
            this.clearInputs()
          }
    }

    private garherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable : Validatable = {
            value: enteredTitle,
            required: true
        }
        const descValidatable: Validatable = {
            value: enteredDescription,
            required: true
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 9
        }

        if (!validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(peopleValidatable)) {
            
            alert('Ilegal input, please try againg!')
            return // void
        } else {
            return[enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }
}

// Instances
const prjInput = new ProjectInput()
const availablePrjs = new ProjectList('active')
const completedPrjs = new ProjectList('finished')