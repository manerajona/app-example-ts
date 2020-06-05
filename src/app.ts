
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


// Model
class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement

    constructor(private type: 'available' | 'completed') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`

        this.attach()
        this.renderContent()
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }

    private renderContent() {
        // <ul>
        const listId = `${this.type}-project-list`
        this.element.querySelector('ul')!.id = listId

        // <h2>
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase().concat(' PROJECTS')
    }
}


class ProjectInput {

    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const importedNode = document.importNode(this.templateElement.content, true)
        
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = 'user-input'

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

        this.configure()

        this.attach()
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }

    private configure() {
        this.element.addEventListener(
            'submit',
            this.submitHandler 
            //this.submitHandler.bind(this) // need to reference this (object) in submitHandler
        )
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault()
        console.log("Submited...")
        const userInput = this.garherUserInput()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput
            console.log(title, desc, people)
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

// Values
const prjInput = new ProjectInput()
const availablePrjs = new ProjectList('available')
const completedPrjs = new ProjectList('completed')