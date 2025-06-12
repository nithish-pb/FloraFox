import { useState } from "react"
import Mission from "./components/Mission"
import Team from "./components/Team"
import Contact from "./components/Contact"
import PageSection from "../../components/CardSection"



const Index = () => {

    const Items = [
        {
            name: "About us",
            component: <Mission />
        },
        {
            name: "Creator",
            component: <Team />
        },
        {
            name: "Contact Us",
            component: <Contact />
        }
    ]
    const [activeItem, setActiveItem] = useState<number>(0)

    return <>
        <PageSection 
            Items={Items}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
        />
    </>
}

export default Index