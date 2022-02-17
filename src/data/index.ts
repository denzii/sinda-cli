import path from "path/posix";
import Env, { HostPlatform } from "../model/env.js";
import { Question, SurveyConfig } from "../view/survey.js";

export default class Data {
    public static config: () => SurveyConfig = () => ({
		footer: {text: "© 2022 Sindagal MIT", colourization: "mind"},
		logo: {
			text: 'S',
			options: {
				glyph: {font: 'Ogre', width:10, horizontalLayout: 'fitted',verticalLayout: 'universal smushing', whitespaceBreak: false},
				colourization: "mind",
			}
		},
		pageToggle: Question.Terminal,
		checkboxGlyph:{ text: "◍", secondaryText:"◌"},
		button: {context:{ owner:undefined, isButton:true}, text: "proceed", secondaryText: "Are you sure? Please press Enter/ESC",  secondaryColourization:"summer", },
		questionGroupIds: [
			{
				name: Question.Terminal,
				context:{
						annotation: {text: "Please choose one or more.", colourization: "teen", },
						heading: {text:"Would you like to Extend your Terminal?", colourization: "cristal",},
						mutuallyExclusive: false,
				},
			},
			{
				name: Question.Shell,
				context:{
					annotation: {text: "Please choose one or more.", colourization: "teen",},
					heading:  {text:"Would you like to modify your Shell?", colourization: "cristal",},
					mutuallyExclusive: false,
				},
			},
			{
				name: Question.Virtual,
				context:{
					annotation: {text: "Please choose one or more.", colourization: "teen",},
					heading:  {text:"Would you like to install Virtualization software on this machine?", colourization: "cristal",},
					mutuallyExclusive: false,
				}
			},
			{
				name: Question.SDK,
				context:{
					annotation: {text: "Please choose one or more.", colourization: "teen",},
					heading:  {text:"Would you like to add a developer toolset on this machine?", colourization: "cristal", },
					mutuallyExclusive: false,
				}
			},
			{
				name: Question.Boilerplate,
				context:{
					annotation: {text: "Please choose one or more.", colourization: "teen",  },
					heading:  {text:"Would you like to fetch some Boilerplate from Github?", colourization: "cristal", },
					mutuallyExclusive: false,
				}
			},
			{
				name:Question.None,
				context:{ 
					annotation: {text: "Please press proceed to confirm.", colourization: "teen",  },
					heading:  {text:"Are you happy with your choices?", colourization: "cristal", },
					mutuallyExclusive: false,
				},
			},
		],
		questions: [
				// {
				// 	context:{
				// 		name: Question.Terminal, owner:undefined, isButton:false,
				// 		cmdKey: "Enable-OhMyPosh",
				// 		availability: [HostPlatform.Windows, HostPlatform.Wsl],
				// 	},
				// 	text: "Get Terminal Themes & Glyphs for Windows Powershell (Installs OhMyPosh & Nerd Fonts)",
				// 		secondaryColourization:"summer"
				// },
				// {
				// 	context:{
				// 		name: Question.Terminal, owner:undefined, isButton:false,
				// 		cmdKey: "Enable-WindowsTerminal",
				// 		availability: [HostPlatform.Windows,  HostPlatform.Wsl],

				// 	}, 
				// 	text: "Get Windows Terminal (Installs Windows Terminal Preview build)", 
					  
				// 	secondaryColourization:"summer"
				// },
				// {
				// 	context:{
				// 		name: Question.Terminal, owner:undefined,isButton:false,
				// 		cmdKey: "Enable-PoshGit",
				// 		availability: [HostPlatform.Windows,  HostPlatform.Wsl],

				// 	},
				// 	text: "Enable Git tab completion (Installs Posh Git)",
					 
				// 	secondaryColourization:"summer"
				// },	
				// {
				// 	context:{
				// 		name: Question.Shell, owner:undefined, isButton:false,
				// 		cmdKey: "Enable-WSL",
				// 		availability: [HostPlatform.Windows,  HostPlatform.Wsl],

				// 	},
				// 	text: "Configure WSL2 Ubuntu (Enables Virtualization & WSL2 Kernel Upgrade)",
					  
				// 	secondaryColourization:"summer"
				// },
				{
					context:{
						name: Question.Shell, owner:undefined, isButton:false,
						cmdKey: "Add-SindaDistro",
						availability: [HostPlatform.Windows, HostPlatform.Wsl],

					}, 
					text: "Configure an Ubuntu instance with ZSH as default shell and OhMyZsh with some common plugins",
					 
					secondaryColourization:"summer"
				},
				// {
				// 	context:{
				// 		name: Question.Virtual, owner:undefined, isButton:false,
				// 		cmdKey: "Get-Docker",
				// 		availability: [HostPlatform.Windows, HostPlatform.Unix],

				// 	},
				// 	text: "Configure Docker (Installs Docker Desktop)",
					 
				// 	secondaryColourization:"summer"
				// },
				// {
				// 	context:{
				// 		name: Question.Virtual, owner:undefined, isButton:false,
				// 		cmdKey: "Get-Podman",
				// 		availability: [HostPlatform.Windows, HostPlatform.Unix],
				// 	},
				// 	text: "Configure Podman (Installs Podman) ",
					 
				// 	secondaryColourization:"summer"
				// },
				// {
				// 	context:{
				// 		name: Question.SDK, owner:undefined, isButton:false,
				// 		cmdKey: "Add-SindaModule",
				// 		availability: [HostPlatform.Windows, HostPlatform.Wsl],
				// 	}, 
				// 	text: "Install Sindagal Powershell Modules on your Windows", 
					  
				// 	secondaryColourization:"summer"
				// },				
				// {
				// context:{
				// 		name: Question.Boilerplate, owner:undefined, isButton:false,
				// 		cmdKey: "Get-GitPortfolio",
				// 		availability: [HostPlatform.Windows, HostPlatform.Unix, HostPlatform.Wsl],
				// 	},
				// 	text: "Download the NextJS Portfolio Template", 
					  
				// 	secondaryColourization:"summer"
				// },
				// {
				// 	context:{
				// 		name: Question.Boilerplate, owner:undefined, isButton:false,
				// 		cmdKey: "Get-GitCLI",
				// 		availability: [HostPlatform.Windows, HostPlatform.Unix, HostPlatform.Wsl],
				// 	},
				// 	text: "Download the CLI App Template",
					 
				// 	secondaryColourization:"summer"
				// },
				{
					context:{ 
						name:Question.None, owner:undefined,isButton:true,
						cmdKey: undefined,
						annotation: {text: "Please press proceed to confirm.", colourization: "teen",  },
						heading:  {text:"Are you happy with your choices?", colourization: "cristal", },
						mutuallyExclusive: false,
					},
					text: "proceed", 
					secondaryText: "Are you sure? Please press Enter/ESC",  secondaryColourization:"summer", 
				},
			]
		});
}