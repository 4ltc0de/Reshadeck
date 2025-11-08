import {
    ButtonItem,
    definePlugin,
    DialogButton,
    Menu,
    MenuItem,
    PanelSection,
    PanelSectionRow,
    ToggleField,
    Router,
    ServerAPI,
    showContextMenu,
    staticClasses,
    Dropdown,
    DropdownOption,
    SingleDropdownOption,
} from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react";
import { MdWbShade } from "react-icons/md";
import logo from "../assets/logo.png";


class ReshadeckLogic {
    serverAPI: ServerAPI;
    dataTakenAt: number = Date.now();

    constructor(serverAPI: ServerAPI) {
        this.serverAPI = serverAPI;
    }
}

const Content: VFC<{ serverAPI: ServerAPI, logic: ReshadeckLogic }> = ({ serverAPI, logic }) => {
    const baseShader = { data: "None", label: "No Shader" } as SingleDropdownOption;
    const [shader_list, set_shader_list] = useState<string[]>([]);
    const [selectedShader, setSelectedShader] = useState<DropdownOption>(baseShader);
    const [shaderOptions, setShaderOptions] = useState<DropdownOption[]>([baseShader]);

    const getShaderOptions = (le_list: string[], baseShaderOrSS: any) => {
        let options: DropdownOption[] = [];
        options.push(baseShaderOrSS);
        for (let i = 0; i < le_list.length; i++) {
            let option = { data: le_list[i], label: le_list[i] } as SingleDropdownOption;
            options.push(option);
        }
        return options;
    }

    const initState = async () => {
        let shader_list = (await serverAPI.callPluginMethod("get_shader_list", {})).result as string[];
        set_shader_list(shader_list)
        setShaderOptions(getShaderOptions(shader_list, baseShader));

        let curr = await serverAPI.callPluginMethod("get_current_shader", {});
        setSelectedShader({ data: curr.result, label: (curr.result == "0" ? "None" : curr.result) } as SingleDropdownOption);
    }

    useEffect(() => {
        initState();
    }, []);

    return (
        <PanelSection title="Select Shader">
            <PanelSectionRow>
                <Dropdown
                    menuLabel="Select shader"
                    strDefaultLabel={selectedShader.label as string}
                    rgOptions={shaderOptions}
                    selectedOption={selectedShader}
                    onChange={async (newSelectedShader: DropdownOption) => {
                        await serverAPI.callPluginMethod("set_shader", { "shader_name": newSelectedShader.data });
                    }}
                />
            </PanelSectionRow>
            <PanelSectionRow>
                <div>Place any custom shaders in <pre>~/.local/share/gamescope</pre><pre>/reshade/Shaders</pre> so that the .fx files are in the root of the Shaders folder.</div>
            </PanelSectionRow>
            <PanelSectionRow>
                <div>WARNING: Shaders can lead to dropped frames and possibly even severe performance problems.</div>
            </PanelSectionRow>
        </PanelSection>
    );
};

export default definePlugin((serverApi: ServerAPI) => {
    let logic = new ReshadeckLogic(serverApi);
    return {
        title: <div className={staticClasses.Title}>Reshadeck</div>,
        content: <Content serverAPI={serverApi} logic={logic} />,
        icon: <MdWbShade />,
        alwaysRender: true
    };
});
