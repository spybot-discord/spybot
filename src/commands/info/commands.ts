import type { ICommandArgs } from '../..';
import { MessageEmbed } from 'discord.js';

export default {
	name: 'commands',
	run({ message }: ICommandArgs) {
		const commandsEmbed = new MessageEmbed()
			.setTitle('<:spybot:939656950231236618> Commands')
      .setDescription('<:arrow:951862606958821506> All bot commands, Prefix .')
      .addField('Config Commands', '**```.config channelcreatelimit, .config channeldeletelimit, .config rolecreatelimit, .config roledeletelimit, .config kicklimit, .config banlimit, .config punishment, .config logs, .whitelist add, .whitelist remove, .whitelist show, .clearuser, .config help, .setup```**')
      .addField('Information Commands', '**```.help, .credits, .vote, .commands```**')
			.setColor('#2F3136')
			.setFooter({
				text: 'Spy Bot',
				iconURL:
					'https://cdn.discordapp.com/avatars/939629038178295828/46177dc48e152f86718afb5f05884159.webp?size=80%22)',
			});
		message.channel.send({ embeds: [commandsEmbed] });
	},
};
