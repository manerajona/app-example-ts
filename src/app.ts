// Autobind decorator
function autobind(_: any, _1: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }
    return adjDescriptor

}


// Model
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

        if (enteredTitle.trim().length == 0 ||
            enteredDescription.trim().length == 0 ||
            enteredPeople.trim().length == 0) {
            alert('Ilegal input, please try againg!')
            return // void
        } else {
            return[enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.titleInputElement.value = ''
    }
}

const prjInput = new ProjectInput()