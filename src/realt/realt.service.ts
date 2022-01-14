import { HttpService, Injectable } from '@nestjs/common';
import { RealTProperty } from 'src/data.model';
import { first } from 'rxjs/operators';

@Injectable()
export class RealtService {
    public realtProperties: RealTProperty[];

    constructor(private httpService: HttpService) {
        this.initRealTProperties();
        setInterval(() => {
            this.initRealTProperties();
        }, 60 * 60 * 24 * 1000);
    }

    initRealTProperties() {
        try {
            console.log('new fetch initRealTProperties');
            this.httpService.get<RealTProperty[]>('https://api.realt.community/v1/token')
                .pipe(first())
                .subscribe(
                    (realtProperties: any) => {
                        this.realtProperties = (realtProperties.data as RealTProperty[]);
                        if (this.realtProperties?.length)
                            console.log('realtProperties correctly refreshed');
                    },
                    (error) => {
                        console.log('realT Properties error', error);
                    }
                )

        } catch (e) {
            console.log('realT Properties catch', e);
        }
    }

}
