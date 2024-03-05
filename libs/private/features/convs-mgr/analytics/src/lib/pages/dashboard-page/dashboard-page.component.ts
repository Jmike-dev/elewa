import { Component, OnDestroy, OnInit } from '@angular/core';

import { SubSink } from 'subsink';
import { Observable } from 'rxjs';

import { ClassroomService } from '@app/state/convs-mgr/classrooms';
import { BotModulesStateService } from '@app/state/convs-mgr/modules';
import { BotsStateService } from '@app/state/convs-mgr/bots';

import { Bot } from '@app/model/convs-mgr/bots';
import { Classroom } from '@app/model/convs-mgr/classroom';
import { BotModule } from '@app/model/convs-mgr/bot-modules';
import { GroupProgressModel, Periodicals } from '@app/model/analytics/group-based/progress';
import { ProgressMonitoringService, ProgressMonitoringState } from '@app/state/convs-mgr/monitoring';

import { AllClassroom, AllCourse } from '../../utils/mock.data';
import { getDateRange } from '../../utils/analytics.utils';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private _sBs = new SubSink();

  courses$: Observable<Bot[]>;
  classrooms$: Observable<Classroom[]>;
  botModules$: Observable<BotModule[]>;

  progress$: Observable<{scopedProgress: GroupProgressModel[], allProgress: GroupProgressModel[]}>;
  period$: Observable<Periodicals>;

  periodical: Periodicals = 'Weekly';

  allCourse = AllCourse; // so i can access this in the template
  allClass = AllClassroom // so i can access this in the template

  activeCourse = this.allCourse;
  activeClassroom = this.allClass;

  loading = true;
  latestProgressData: GroupProgressModel;

  private _state$$: ProgressMonitoringState;

  constructor(
    private _clasroomServ$: ClassroomService,
    private _botModServ$: BotModulesStateService,
    private _botServ$: BotsStateService,
    private _progressService: ProgressMonitoringService
  ) { 
    this._state$$ = _progressService.getProgressState();
  }
  
  
  ngOnInit() {
    this.progress$ = this._state$$.getProgress();
    
    this.period$ = this._state$$.getPeriod();

    this.initStateDataLayer();
  }
  
  initStateDataLayer() {
    this.courses$ = this._botServ$.getBots();
    this.classrooms$ = this._clasroomServ$.getAllClassrooms();
    this.botModules$ = this._botModServ$.getBotModules(); 
  }

  selectActiveCourse(course: Bot) {
    this.activeCourse = course;
  }

  selectActiveClassroom(classroom: Classroom) {
    this.activeClassroom = classroom;
  }

  selectProgressTracking(trackBy: Periodicals) {
    this._state$$.setPeriod(trackBy);
    this.periodical = trackBy;
  }

  getDateRange(period: Periodicals | null) {
    return getDateRange(period);
  }

  ngOnDestroy() {
    this._sBs.unsubscribe();
  }
}
