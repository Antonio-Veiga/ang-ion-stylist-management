export class PrimaryPages {
    static pages() {
        return [
            {
                url: '../home',
                icon: 'calendar-outline',
                title: 'Calendário'
            },
            {
                url: '../clients',
                icon: 'person-outline',
                title: 'Clientes'
            },
            {
                url: '../services',
                icon: 'construct-outline',
                title: 'Serviços'
            },
            {
                url: '../absences',
                icon: 'eye-off-outline',
                title: 'Ausências'
            },
            {
                url: '../forms',
                icon: 'clipboard-outline',
                title: 'Formulários'
            }
        ]
    }
}

export class SecondaryPages {
    static pages() {
        return [
            {
                url: '../settings',
                icon: 'settings',
                title: 'Definições'
            }
        ]
    }
}