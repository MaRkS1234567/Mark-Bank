import ChildComponent from "@/core/component/child-screen.component";import RenderService from "@/core/services/render.service";
import template from './actions.template.html'
import styles from './actions.module.scss'
import { $M } from "@/core/mquery/mquery.lib";
import { Store } from "@/core/store/store";
import { CardService } from "@/api/card.service";
import { NotificationService } from "@/core/services/notification.service";
import { Field } from "@/components/ui/field/field.component";
import { Button } from "@/components/ui/button/button.component";
import validationService from "@/core/services/validation.service";
import { BALANCE_UPDATE } from "@/constants/event.constants";

export class Actions extends ChildComponent {
    constructor() {
        super()

        this.store = Store.getInstance().state
        this.cardService = new CardService()
        this.notificationService = new NotificationService()
    }

    /**
     * 
     * @param {Event} event - The event object from the button click event.
     * @param {'top-up' | 'withdrawal'} type - The type of the transactions , either "top-up" pr "withdrawal"
     */
    updateBalance(event, type) {
        event.preventDefault()

        if(!this.store.user) {
            this.notificationService.show('error', 'You need authorization!')
        }

        $M(event.target).text('Sending...').attr('disabled', true)

        const inputElement = $M(this.element).find('input')
        const amount = inputElement.value()

        if(!amount){
            validationService.showError($M(this.element).find('input'))
            return
        }

        this.cardService.updateBalance(amount, type, () => {
            inputElement.value('')

            const balanceUpdatedEvent = new Event(BALANCE_UPDATE)
            document.dispatchEvent(balanceUpdatedEvent)
        })

        $M(event.target).removeAttr('disabled').text(type)
    }

    render(){
        this.element = RenderService.htmlToElement(template, [
            new Field({
                name: 'amount',
                placeholder: 'Enter amount',
                type: 'number'
            })
        ], styles);

        $M(this.element)
            .find('#action-buttons')
            .append(
                new Button({
                    children: 'Top-up',
                    variant: 'green',
                    onClick: e => this.updateBalance(e, 'top-up')
                }).render()
            )
            .append(
                new Button({
                    children: 'Withdrawal',
                    variant: 'purple',
                    onClick: e => this.updateBalance(e, 'withdrawal')
                }).render()
            )

        return this.element;
    }
}