import type { CommandInteraction, Client, Message } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders';

export type Handler = (handler: { client: Client }) => void;

export interface Slash {
	name: string;
	command: SlashCommandBuilder;
	run(args: SlashArgs): Promise<void>;
}

export interface Command {
	name: string;
	run(args: CommandArgs): void | Promise<void>;
	aliases: string[];
}

interface SlashArgs {
	client: Client;
	interaction: CommandInteraction;
}

interface CommandArgs {
	client: Client;
	message: Message;
	args: string[];
}