import type { LimitType } from '@prisma/client';
import type { Client, Guild, GuildAuditLogs, TextChannel } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { prisma } from '../database';
import punish from './punish';

interface LoggerOptions {
	type: LimitType;
	audits: GuildAuditLogs<any>;
	reason: string;
	client: Client;
	guild: Guild;
}

export const createLog = async ({ type, audits, reason, guild, client }: LoggerOptions) => {
	const log = audits.entries.first();
	const user = log?.executor;
	if (user?.id === client.user?.id) return;
	const personLimit = await prisma.userLimit.findUnique({
		where: { guild_user_type: { guild: guild.id, user: user?.id!, type } },
		select: { limit: true },
	});
	const { limit } = (await prisma.limit.findUnique({
		where: { guild_type: { guild: guild.id, type } },
		select: { limit: true },
	}))!;
	const whitelist = await prisma.whitelist.findUnique({
		where: { guild: guild.id },
		select: { users: true },
	});
	if (whitelist?.users.some(id => id === user?.id)) return;
	if (!limit) return;
	if ((personLimit?.limit || 0) !== 0 && personLimit?.limit! % limit === 0) {
		const logsID = await prisma.channel.findUnique({
			where: { guild_type: { guild: guild.id, type: 'LOGS' } },
			select: { channel: true },
		});
		const logs = (await client.channels.fetch(logsID?.channel!)) as TextChannel | null;
		if (!logs) return;
		const punishment = await prisma.punish.findUnique({
			where: { guild: guild.id },
			select: { option: true },
		});
		if (!punishment?.option) return;
		const embed = new MessageEmbed()
			.setTitle('**Spy Bot**')
			.setThumbnail(user?.displayAvatarURL({ dynamic: true })!)
			.setFooter({
				text: guild.name,
				iconURL: guild.iconURL()!,
			})
			.addField('User', user?.tag!)
			.addField('Case', reason)
			.addField('Punishment', punishment.option);
		const punishCheck = punishment.option === 'QUARANTINE' || punishment.option === 'DEMOTE' ? 'd' : 'ed';
		try {
			await punish({
				member: await guild.members.fetch(user?.id!)!,
				reason,
				guild: guild.id,
			});
			embed.addField(punishment.option.toLowerCase().concat(punishCheck), 'Yes');
			embed.setColor('#06CB08');
		} catch (err) {
			embed.addField(punishment.option.toLowerCase().concat(punishCheck), 'No');
			embed.setColor('RED');
			console.error(err);
		} finally {
			logs.send({ embeds: [embed] });
		}
	}
	await prisma.userLimit.upsert({
		where: { guild_user_type: { guild: guild.id, user: user?.id!, type } },
		update: { limit: { increment: 1 } },
		create: {
			guild: guild.id,
			user: user?.id!,
			type,
			limit: 1,
		},
	});
};
