import { GlobalObserver, Message } from "./GlobalMessenger";
import { SupernovaScreen } from "./SupernovaScreen";
import { feed, messenger, gameManager, playerData } from "./app";

export class TimeLoop implements GlobalObserver
{
	static ACTION_POINTS_PER_LOOP: number = 15;
	_actionPoints: number;

	_isTimeLoopEnabled: boolean;
	_triggerSupernova: boolean;

	init(): void
	{
		this._actionPoints = TimeLoop.ACTION_POINTS_PER_LOOP;
		this._isTimeLoopEnabled = true;
		this._triggerSupernova = false;
		
		feed.publish("You wake up next to a campfire near your village's launch tower. Today's the big day!");
		feed.publish("In the sky, you notice a bright object flying away from Giant's Deep...", true);

		messenger.addObserver(this);
	}

	onReceiveGlobalMessage(message: Message): void
	{
		if (message.id === "disable time loop" && this._isTimeLoopEnabled)
		{
			this._isTimeLoopEnabled = false;
			feed.publish("you disable the time loop device", true);
		}
	}

	lateUpdate(): void
	{
		if (this._triggerSupernova)
		{
			this._triggerSupernova = false;
			gameManager.swapScreen(new SupernovaScreen());
		}
	}

	getEnabled(): boolean
	{
		return this._isTimeLoopEnabled;
	}

	getLoopPercent(): number
	{
		return (TimeLoop.ACTION_POINTS_PER_LOOP - this._actionPoints) / TimeLoop.ACTION_POINTS_PER_LOOP;
	}

	getActionPoints(): number
	{
		return this._actionPoints;
	}

	waitFor(minutes: number): void
	{
		feed.publish("you chill out for 1 minute", true);
		this.spendActionPoints(minutes);
	}

	spendActionPoints(points: number): void
	{
		if (playerData.isPlayerAtEOTU()) {return;}
		
		const lastActionPoints: number = this._actionPoints;

		this._actionPoints = max(0, this._actionPoints - points);
		messenger.sendMessage("action points spent");

		// detect when you have 1/4 your action points remaining
		if (lastActionPoints > TimeLoop.ACTION_POINTS_PER_LOOP * 0.25 && this._actionPoints <= TimeLoop.ACTION_POINTS_PER_LOOP * 0.25)
		{
			feed.publish("you notice the Sun is getting awfully big and red", true);
		}

		if (this._actionPoints == 0)
		{
			this._triggerSupernova = true;
		}
	}

	renderTimer(): void
	{
		if (playerData.isPlayerAtEOTU()) {return;}

		const r: number = 50;
		const x: number = 50;
		const y: number = height - 50;

		stroke(0, 0, 100);
		fill(0, 0, 0);
		ellipse(x, y, r, r);
		fill(30, 100, 100);
		arc(x, y, r, r, 0 - PI * 0.5 + TAU * this.getLoopPercent(), 1.5 * PI);
		// fill(0, 0, 100);
		// textSize(20);
		// textAlign(RIGHT, TOP);
		// text("Time Remaining: " + _actionPoints + " min", width - 25, 25);
	}
}