
const MenuList = ['Pokemon', 'Items', 'Visit City', 'Encounter']

const MenuButton = (props) => {
    return (
        <button onClick={props.clicky} className="menuButton">
            {props.text}
        </button>
    )
}

const Menu = () => {
    return (
        <>
            <div><MenuButton text={MenuList[0]} clicky={() => {}}/></div>
            <div><MenuButton text={MenuList[1]} clicky={() => {}} /></div>
            <div><MenuButton text={MenuList[2]} clicky={() => {}} /></div>
            <div><MenuButton text={MenuList[3]} clicky={() => {}} /></div>
        </>
    )
}

export default Menu